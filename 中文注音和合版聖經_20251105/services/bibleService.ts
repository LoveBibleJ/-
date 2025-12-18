import { bibleIndex, BookIndex } from '../data/bibleIndex';
import { Chapter, Book } from '../types';

/**
 * Gets all books from the Old Testament.
 */
export const getOldTestamentBooks = (): BookIndex[] => {
  return bibleIndex.filter(book => book.testament === 'OT');
};

/**
 * Gets all books from the New Testament.
 */
export const getNewTestamentBooks = (): BookIndex[] => {
  return bibleIndex.filter(book => book.testament === 'NT');
};

/**
 * Gets information about a specific book from the index.
 * @param bookId The ID of the book (e.g., 'Gen').
 * @returns BookIndex object or null if not found.
 */
export const getBookInfo = (bookId: string): BookIndex | null => {
  return bibleIndex.find(book => book.id === bookId) || null;
};

/**
 * Fetches the data for a specific book and returns the specified chapter.
 * @param bookId The ID of the book (e.g., 'Gen').
 * @param chapterId The chapter number.
 * @returns Chapter data or null if not found or on error.
 */
export const getChapterData = async (bookId: string, chapterId: number): Promise<Chapter | null> => {
  const bookInfo = getBookInfo(bookId);
  if (!bookInfo) {
    console.error(`Book with ID "${bookId}" not found in bibleIndex.`);
    return null;
  }

  const filePath = `/public/${bookInfo.testament}/${bookId}.json`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`無法載入書卷數據: ${bookId}.json (狀態: ${response.status})`);
    }

    const bookData: Book = await response.json();

    if (bookData && bookData.chapters) {
      const chapter = bookData.chapters.find(c => c.chapter === chapterId);
      if (!chapter) {
        console.error(`在書卷 ${bookId} 中找不到第 ${chapterId} 章。`);
        return null;
      }
      return chapter;
    }
    
    console.error(`Book data for ${bookId} is not in the expected format or has no chapters.`);
    return null;
  } catch (error) {
    console.error(`數據載入失敗 for ${filePath}:`, error);
    return null;
  }
};

/**
 * Calculates the link to the next chapter, handling transitions to the next book.
 * @param bookId The ID of the current book.
 * @param chapterId The current chapter number.
 * @returns The URL for the next chapter or null if at the end of the Bible.
 */
export const getNextChapterLink = (bookId: string, chapterId: number): string | null => {
  const currentBookIndex = bibleIndex.findIndex(b => b.id === bookId);
  
  if (currentBookIndex === -1) {
    return null;
  }

  const currentBook = bibleIndex[currentBookIndex];

  if (chapterId < currentBook.chapters) {
    return `/read/${bookId}/${chapterId + 1}`;
  } else {
    // End of the book, try to go to the next book
    if (currentBookIndex < bibleIndex.length - 1) {
      const nextBook = bibleIndex[currentBookIndex + 1];
      return `/read/${nextBook.id}/1`;
    } else {
      // End of the Bible
      return null;
    }
  }
};

/**
 * Calculates the link to the previous chapter, handling transitions to the previous book.
 * @param bookId The ID of the current book.
 * @param chapterId The current chapter number.
 * @returns The URL for the previous chapter or null if at the beginning of the Bible.
 */
export const getPrevChapterLink = (bookId: string, chapterId: number): string | null => {
  const currentBookIndex = bibleIndex.findIndex(b => b.id === bookId);

  if (currentBookIndex === -1) {
    return null;
  }

  if (chapterId > 1) {
    return `/read/${bookId}/${chapterId - 1}`;
  } else {
    // Beginning of the book, try to go to the previous book
    if (currentBookIndex > 0) {
      const prevBook = bibleIndex[currentBookIndex - 1];
      return `/read/${prevBook.id}/${prevBook.chapters}`;
    } else {
      // Beginning of the Bible
      return null;
    }
  }
};
