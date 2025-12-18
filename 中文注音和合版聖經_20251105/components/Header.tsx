import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Verse } from '../types';

interface HeaderProps {
  bookName: string;
  currentChapter: number;
  totalChapters: number;
  bookId: string;
  verses: Verse[];
  onVerseSelect: (verse: number) => void;
}

const Header: React.FC<HeaderProps> = ({ bookName, currentChapter, totalChapters, bookId, verses, onVerseSelect }) => {
  const navigate = useNavigate();

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChapter = e.target.value;
    navigate(`/read/${bookId}/${newChapter}`);
  };

  const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const verse = parseInt(e.target.value, 10);
    if (!isNaN(verse)) {
      onVerseSelect(verse);
    }
    // Reset selection to allow re-selecting the same verse
    e.target.value = "";
  };

  const chapterOptions = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-10 flex items-center justify-between px-4 md:px-8 border-b border-stone-200">
      <Link to="/" className="text-lg font-semibold text-sky-700 hover:text-sky-900 transition-colors">
        &larr; 回首頁
      </Link>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <h1 className="text-xl md:text-2xl font-bold text-stone-700 hidden sm:block">{bookName}</h1>
         <h1 className="text-xl md:text-2xl font-bold text-stone-700 sm:hidden">{bookName.substring(0, 2)}</h1>
        <select
          value={currentChapter}
          onChange={handleChapterChange}
          className="bg-stone-100 border border-stone-300 rounded-md p-2 text-stone-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          aria-label="選擇章"
        >
          {chapterOptions.map(chapNum => (
            <option key={chapNum} value={chapNum}>
              第 {chapNum} 章
            </option>
          ))}
        </select>
        <select
          onChange={handleVerseChange}
          className="bg-stone-100 border border-stone-300 rounded-md p-2 text-stone-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          aria-label="選擇節"
          defaultValue=""
        >
          <option value="" disabled>選擇節</option>
          {verses.map(v => (
            <option key={v.verse} value={v.verse}>
              第 {v.verse} 節
            </option>
          ))}
        </select>
      </div>

      {/* Placeholder for potential future actions like settings or search */}
      <div className="w-24 hidden sm:block"></div>
    </header>
  );
};

export default Header;