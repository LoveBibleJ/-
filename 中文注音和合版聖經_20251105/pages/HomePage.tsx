
import React from 'react';
import { Link } from 'react-router-dom';
import { BookIndex } from '../data/bibleIndex';
import { getOldTestamentBooks, getNewTestamentBooks } from '../services/bibleService';

const HomePage: React.FC = () => {
  const oldTestamentBooks = getOldTestamentBooks();
  const newTestamentBooks = getNewTestamentBooks();

  const BookLink: React.FC<{ book: BookIndex }> = ({ book }) => {
    return (
      <li>
        <Link 
          to={`/read/${book.id}/1`} 
          className="text-sky-700 hover:text-sky-900 hover:underline transition-colors duration-300"
        >
          {book.name}
        </Link>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-stone-700 tracking-wider">中文注音和合版聖經</h1>
        <p className="text-stone-500 mt-2">直式排版閱讀體驗</p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-stone-200">
          <h2 className="text-3xl font-semibold text-stone-800 border-b-2 border-stone-200 pb-4 mb-6">舊約</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-lg">
            {oldTestamentBooks.map(book => <BookLink key={book.id} book={book} />)}
          </ul>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-stone-200">
          <h2 className="text-3xl font-semibold text-stone-800 border-b-2 border-stone-200 pb-4 mb-6">新約</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-lg">
            {newTestamentBooks.map(book => <BookLink key={book.id} book={book} />)}
          </ul>
        </div>
      </main>

      <footer className="mt-16 text-center text-stone-400">
        <p>&copy; {new Date().getFullYear()} Bible Project. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
