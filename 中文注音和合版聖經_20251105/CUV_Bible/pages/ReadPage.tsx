import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapterData, getBookInfo, getPrevChapterLink, getNextChapterLink } from '../services/bibleService';
import { Chapter } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ReadPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [bookName, setBookName] = useState<string>('');
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const scriptureContainerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Map<number, HTMLParagraphElement>>(new Map());

  const chapterIdNum = parseInt(chapterId || '1', 10);

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!bookId || isNaN(chapterIdNum)) {
        setError("無效的書卷或章節參數。");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setChapterData(null);
      verseRefs.current.clear();

      try {
        const bookInfo = getBookInfo(bookId);
        if (!bookInfo) {
          throw new Error(`在索引中找不到書卷資訊: ${bookId}`);
        }
        setBookName(bookInfo.name);
        setTotalChapters(bookInfo.chapters);

        if (chapterIdNum < 1 || chapterIdNum > bookInfo.chapters) {
          navigate(`/read/${bookId}/1`, { replace: true });
          return;
        }

        const data = await getChapterData(bookId, chapterIdNum);
        if (data) {
          setChapterData(data);
        } else {
          throw new Error(`Could not load data for ${bookId} chapter ${chapterIdNum}. The file might be missing.`);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("讀取經文時發生未知錯誤。");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterData();
  }, [bookId, chapterId, navigate, chapterIdNum]);
  
  useLayoutEffect(() => {
    if (scriptureContainerRef.current && chapterData) {
      const container = scriptureContainerRef.current;
      // Scroll to the far right to start reading from the beginning in vertical mode
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    }
  }, [chapterData]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (scriptureContainerRef.current) {
      scriptureContainerRef.current.scrollLeft += event.deltaY;
    }
  };
  
  const prevLink = bookId ? getPrevChapterLink(bookId, chapterIdNum) : null;
  const nextLink = bookId ? getNextChapterLink(bookId, chapterIdNum) : null;

  const goToPrevChapter = useCallback(() => {
    if (prevLink) navigate(prevLink);
  }, [navigate, prevLink]);

  const goToNextChapter = useCallback(() => {
    if (nextLink) navigate(nextLink);
  }, [navigate, nextLink]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
            return;
        }

        let scrollAmount = 100; 
        
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (scriptureContainerRef.current) {
              scriptureContainerRef.current.scrollLeft -= scrollAmount;
            }
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (scriptureContainerRef.current) {
              scriptureContainerRef.current.scrollLeft += scrollAmount;
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            goToPrevChapter();
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            goToNextChapter();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPrevChapter, goToNextChapter]);

  const handleVerseSelect = (verseNum: number) => {
    const verseElement = verseRefs.current.get(verseNum);
    if (verseElement && scriptureContainerRef.current) {
        const container = scriptureContainerRef.current;
        const verseOffsetLeft = verseElement.offsetLeft;
        const containerRect = container.getBoundingClientRect();
        
        // In vertical-rl, offsetLeft is the distance from the right edge of the container
        // to the right edge of the element.
        const targetScrollLeft = container.scrollWidth - container.clientWidth - verseOffsetLeft;

        container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-2xl text-stone-500">讀取中...</div>;
    }
    if (error) {
      return (
        <div className="text-red-600">
          <h2 className="text-2xl mb-4">讀取錯誤</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-sky-700 text-white rounded">返回首頁</button>
        </div>
      );
    }
    if (!chapterData) {
      return <div className="text-2xl text-stone-500">找不到章節資料。</div>;
    }
    return (
       <div
        ref={scriptureContainerRef}
        onWheel={handleWheel}
        className="w-full"
        style={{
          height: 'calc(100vh - 8rem)',
          overflowX: 'auto',
          overflowY: 'hidden',
          textAlign: 'justify',
          textJustify: 'inter-character',
        }}
      >
        <div
          className="scripture-content text-stone-800 text-3xl"
          style={{
            writingMode: 'vertical-rl',
            columnWidth: '18em',
            columnGap: '3em',
            height: '100%',
            textOrientation: 'upright',
            padding: '1rem 2rem',
          }}
        >
          <p className="text-stone-500 mb-6 text-xl" style={{ writingMode: 'horizontal-tb', textCombineUpright: 'none' }}>
            本章共 {chapterData.verses.length} 節
          </p>
          {chapterData.verses.map(verse => (
            <p
              key={verse.verse}
              id={`verse-${verse.verse}`}
              ref={node => {
                if (node) verseRefs.current.set(verse.verse, node);
                else verseRefs.current.delete(verse.verse);
              }}
              className="verse-paragraph mb-6"
              style={{ display: 'inline-block', width: '100%' }}
            >
              <span
                className="verse-num text-sky-700 font-bold"
                style={{
                  textCombineUpright: 'all',
                  writingMode: 'horizontal-tb',
                  display: 'inline-block',
                  fontSize: '0.7em',
                  marginRight: '0.5em',
                }}
              >
                {verse.verse}
              </span>
              <span className="font-scripture" style={{ lineHeight: 2.5 }}>
                {verse.text}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
      <Header 
        bookName={bookName}
        currentChapter={chapterIdNum}
        totalChapters={totalChapters}
        bookId={bookId ?? ''}
        verses={chapterData?.verses || []}
        onVerseSelect={handleVerseSelect}
      />
      
      <main className="flex-grow flex items-center justify-center px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        {renderContent()}
      </main>

      <Footer prevLink={prevLink} nextLink={nextLink} />
    </div>
  );
};

export default ReadPage;