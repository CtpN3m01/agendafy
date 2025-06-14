// src/hooks/use-meetings-optimized.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMeetings, ReunionData } from './use-meetings';

interface UseMeetingsOptimizedOptions {
  organizacionId?: string;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  enablePagination?: boolean;
  pageSize?: number;
  sortBy?: 'fecha' | 'titulo' | 'estado';
  sortOrder?: 'asc' | 'desc';
}

interface UseMeetingsOptimizedReturn {
  // Data
  meetings: ReunionData[];
  filteredMeetings: ReunionData[];
  paginatedMeetings: ReunionData[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
    // Actions
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  updateMeeting: (id: string, data: any) => Promise<any>;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Statistics
  stats: {
    total: number;
    programadas: number;
    enCurso: number;
    finalizadas: number;
  };
  
  // Utilities
  getMeetingStatus: (meeting: ReunionData) => 'programada' | 'en_curso' | 'finalizada';
  searchTerm: string;
}

export function useMeetingsOptimized(options: UseMeetingsOptimizedOptions = {}): UseMeetingsOptimizedReturn {
  const {
    organizacionId,
    enableAutoRefresh = false,
    refreshInterval = 30000,
    enablePagination = false,
    pageSize = 10,
    sortBy = 'fecha',
    sortOrder = 'asc'
  } = options;
  // Base hook
  const { meetings, isLoading, error, refetch, updateMeeting } = useMeetings(organizacionId);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (!enableAutoRefresh || !organizacionId) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, refreshInterval, organizacionId]);

  // Utility function to determine meeting status
  const getMeetingStatus = useCallback((meeting: ReunionData): 'programada' | 'en_curso' | 'finalizada' => {
    const now = new Date();
    const startTime = new Date(meeting.hora_inicio);
    const endTime = meeting.hora_fin ? new Date(meeting.hora_fin) : null;

    if (endTime && now > endTime) {
      return "finalizada";
    } else if (now >= startTime && (!endTime || now <= endTime)) {
      return "en_curso";
    } else {
      return "programada";
    }
  }, []);

  // Filtered meetings based on search term
  const filteredMeetings = useMemo(() => {
    if (!searchTerm.trim()) return meetings;

    const term = searchTerm.toLowerCase().trim();
    return meetings.filter(meeting => 
      meeting.titulo.toLowerCase().includes(term) ||
      (meeting.lugar && meeting.lugar.toLowerCase().includes(term)) ||
      (meeting.tipo_reunion && meeting.tipo_reunion.toLowerCase().includes(term)) ||
      (meeting.modalidad && meeting.modalidad.toLowerCase().includes(term))
    );
  }, [meetings, searchTerm]);

  // Sorted meetings
  const sortedMeetings = useMemo(() => {
    const sorted = [...filteredMeetings];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'fecha':
          comparison = new Date(a.hora_inicio).getTime() - new Date(b.hora_inicio).getTime();
          break;
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo);
          break;
        case 'estado':
          const statusA = getMeetingStatus(a);
          const statusB = getMeetingStatus(b);
          comparison = statusA.localeCompare(statusB);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [filteredMeetings, sortBy, sortOrder, getMeetingStatus]);

  // Pagination calculations
  const totalPages = enablePagination ? Math.ceil(sortedMeetings.length / pageSize) : 1;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Paginated meetings
  const paginatedMeetings = useMemo(() => {
    if (!enablePagination) return sortedMeetings;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedMeetings.slice(startIndex, endIndex);
  }, [sortedMeetings, currentPage, pageSize, enablePagination]);

  // Statistics
  const stats = useMemo(() => {
    const total = meetings.length;
    let programadas = 0;
    let enCurso = 0;
    let finalizadas = 0;

    meetings.forEach(meeting => {
      const status = getMeetingStatus(meeting);
      switch (status) {
        case 'programada':
          programadas++;
          break;
        case 'en_curso':
          enCurso++;
          break;
        case 'finalizada':
          finalizadas++;
          break;
      }
    });

    return { total, programadas, enCurso, finalizadas };
  }, [meetings, getMeetingStatus]);

  // Refresh function with loading state
  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refetch]);

  // Pagination controls
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return {
    // Data
    meetings,
    filteredMeetings,
    paginatedMeetings,
    
    // Loading states
    isLoading,
    isRefreshing,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
      // Actions
    refetch,
    refresh,
    updateMeeting,
    setSearchTerm,
    setCurrentPage,
    nextPage,
    previousPage,
    
    // Statistics
    stats,
    
    // Utilities
    getMeetingStatus,
    searchTerm,
  };
}
