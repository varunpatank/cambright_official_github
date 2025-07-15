"use client"

import React, { useState, useCallback } from 'react'
import { Check, Search, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface UserSearchUser {
  id: string
  name: string
  email: string
  imageUrl?: string
  username?: string
}

interface UserSearchSelectProps {
  onUserSelect: (user: UserSearchUser | null) => void
  selectedUser: UserSearchUser | null
  placeholder?: string
  label?: string
  disabled?: boolean
}

export function UserSearchSelect({ 
  onUserSelect, 
  selectedUser, 
  placeholder = "Search for a user...",
  label = "User",
  disabled = false
}: UserSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search users')
      }
      const users = await response.json()
      setSearchResults(users)
      setShowResults(true)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchUsers(value)
  }

  const handleUserSelect = (user: UserSearchUser) => {
    onUserSelect(user)
    setSearchQuery(user.name)
    setShowResults(false)
    setSearchResults([])
  }

  const handleClear = () => {
    onUserSelect(null)
    setSearchQuery('')
    setShowResults(false)
    setSearchResults([])
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-n-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={disabled}
            className="pl-10 pr-10 bg-n-7 border-n-6 text-n-1 placeholder:text-n-4"
          />
          {selectedUser && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-n-6"
            >
              ×
            </Button>
          )}
        </div>

        {/* Selected User Display */}
        {selectedUser && !showResults && (
          <div className="mt-2 p-3 bg-n-6 rounded-lg border border-n-5">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser.imageUrl} alt={selectedUser.name} />
                <AvatarFallback className="bg-n-5 text-n-1">
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-n-1">{selectedUser.name}</div>
                <div className="text-sm text-n-3">{selectedUser.email}</div>
              </div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/20">
                <Check className="h-3 w-3 mr-1" />
                Selected
              </Badge>
            </div>
          </div>
        )}

        {/* Search Results */}
        {showResults && (searchResults.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-n-7 border border-n-6 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-n-3">
                <Search className="h-4 w-4 animate-spin mx-auto mb-2" />
                Searching users...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-1">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-n-6 cursor-pointer border-b border-n-6 last:border-b-0 transition-colors"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.imageUrl} alt={user.name} />
                        <AvatarFallback className="bg-n-5 text-n-1">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-n-1">{user.name}</div>
                        <div className="text-sm text-n-3">{user.email}</div>
                        {user.username && (
                          <div className="text-xs text-n-4">@{user.username}</div>
                        )}
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-n-3">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No users found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 