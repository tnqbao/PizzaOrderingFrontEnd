"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info, Search } from "lucide-react"
import { SearchTreeMindmap } from "@/components/contents/blog/search-tree-mindmap"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";

interface SearchResult {
    id: string
    title: string
    similarity: number
    content: string
}

interface SearchResponse {
    results: SearchResult[]
}

export default function BlogMapPage() {
    const [showInfo, setShowInfo] = useState(false)
    const params = useParams();
    const searchParams = useSearchParams();
    const keywordParam = searchParams.get('keyword');

    const [searchTerm, setSearchTerm] = useState<string>(Array.isArray(params.keyword)
        ? params.keyword[0] || ""
        : params.keyword || "")
    const [inputValue, setInputValue] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const ai_api = localStorage.getItem("ai_api")

    // Initialize input value and trigger search when page loads with keyword parameter
    useEffect(() => {
        if (keywordParam) {
            setInputValue(keywordParam)
            // Trigger search with the keyword from URL
            const fetchSearchResults = async () => {
                setIsSearching(true)
                setSearchTerm(keywordParam)

                try {
                    const response = await axios.post(`${ai_api}/search`, {
                        content: keywordParam,
                        limit: 10,
                    })

                    if (response.status === 200) {
                        setSearchResults(response.data.results)
                    }
                } catch (error) {
                    console.error("Search error:", error)
                } finally {
                    setIsSearching(false)
                }
            }

            fetchSearchResults()
        }
    }, [keywordParam, ai_api])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        setIsSearching(true)
        setSearchTerm(inputValue)

        try {
            const response = await axios.post(`${ai_api}/search`, {
                content: inputValue,
                limit: 10,
            })

            if (response.status !== 200) {
                throw new Error("Search request failed")
            }

            const data: SearchResponse = response.data
            setSearchResults(data.results)
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Blog Mindmap</h1>
                        <p className="text-gray-600">Khám phá các bài viết theo cấu trúc cây nhị phân</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowInfo(!showInfo)}
                            className="text-gray-700 border-gray-300"
                        >
                            <Info className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {showInfo && (
                        <motion.div
                            className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-5 text-sm"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className="font-medium mb-2 text-gray-900">Cách sử dụng mindmap:</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                <li>Nhập từ khóa tìm kiếm để xem các bài viết liên quan</li>
                                <li>Node gốc (bên trái) đại diện cho từ khóa tìm kiếm của bạn</li>
                                <li>Mỗi node chỉ có tối đa 2 node con, tạo thành cấu trúc cây nhị phân ngang</li>
                                <li>Các bài viết được sắp xếp theo độ tương đồng (similarity) với từ khóa tìm kiếm</li>
                                <li>Di chuột qua các node để xem thông tin chi tiết</li>
                                <li>Nhấp vào node bài viết để xem nội dung đầy đủ</li>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSearch} className="mb-5 flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            placeholder="Nhập từ khóa tìm kiếm..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="pr-10 border-gray-300"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <Button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white" disabled={isSearching}>
                        {isSearching ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Đang tìm...</span>
                            </div>
                        ) : (
                            <span>Tìm kiếm</span>
                        )}
                    </Button>
                </form>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-280px)]">
                    <SearchTreeMindmap searchTerm={searchTerm} searchResults={searchResults} />
                </div>
            </div>
        </div>
    )
}