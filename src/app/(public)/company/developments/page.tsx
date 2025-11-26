"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "../../../../lib/client";
import Navbar from "../../../../components/layout/Navbar";
import Footer from "../../../../components/layout/Footer";
import { ArrowRight, FileText, ChevronLeft, ChevronRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
};

// --- Helper function to generate pagination range ---
const DOTS = '...';

const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage: number;
}) => {
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    /*
    	Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

      return [...leftRange, DOTS, totalPageCount];
    }

    /*
    	Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPageCount - rightItemCount + i + 1);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
    	Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};


export default function DevelopmentsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 7; // 1 featured + 6 grid items

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const paginationRange = usePagination({
    currentPage,
    totalCount: totalPosts,
    pageSize: postsPerPage,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category", "development")
        .eq("status", "published");

      setTotalPosts(count || 0);

      // Get paginated posts
      const from = (currentPage - 1) * postsPerPage;
      const to = from + postsPerPage - 1;

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, featured_image, published_at")
        .eq("category", "development")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const onNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const onPrevious = () => {
    setCurrentPage(currentPage - 1);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-5xl font-bold text-gray-900 mt-8">Developments</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {posts.length === 0 ? (
            // Empty State
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                No posts found
              </h2>
              <p className="text-gray-600 mb-6">
                There are no development updates published yet. Check back soon!
              </p>
              <a
                href="/company/about-us"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Learn About Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>
          ) : (
            <>
              {/* Featured Post (First Post) */}
              <div className="mb-12">
                <a
                  href={`/company/developments/${posts[0].slug}`}
                  className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-full bg-gray-100 overflow-hidden">
                      {posts[0].featured_image ? (
                        <img
                          src={posts[0].featured_image}
                          alt={posts[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <FileText className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4 line-clamp-2">
                        {posts[0].title}
                      </h2>
                      {/* <p className="text-gray-600 mb-6 line-clamp-3">
                        {posts[0].excerpt || "Read this article to learn more..."}
                      </p> */}
                      <div className="inline-flex items-center text-blue-600 font-semibold">
                        Read More
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </a>
              </div>

              {/* Grid Posts */}
              {posts.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {posts.slice(1).map((post) => (
                    <a
                      key={post.id}
                      href={`/company/developments/${post.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                    >
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <FileText className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        {/* <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt || "Read this article to learn more..."}
                        </p> */}
                        <div className="inline-flex items-center text-blue-600 font-semibold">
                          Read More
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* --- NEW PAGINATION COMPONENT --- */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="flex justify-center items-center gap-2 mt-16"
                >
                  <button
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-white text-slate-700 font-medium border border-slate-300 transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {paginationRange?.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                      return (
                        <span key={`dots-${index}`} className="flex items-center justify-center w-10 h-10 text-slate-500">
                          &#8230;
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(Number(pageNumber))}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-md font-medium border transition-colors ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white border-blue-600 cursor-default"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-white text-slate-700 font-medium border border-slate-300 transition-colors hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

