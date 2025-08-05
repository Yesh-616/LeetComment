import { useState, useEffect } from 'react';
import { solutionsAPI } from '../services/api';

export const useSolutions = () => {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch all solutions
  const fetchSolutions = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.getSolutions(params);
      
      if (response.success) {
        setSolutions(response.data);
        setPagination(response.pagination || {});
      } else {
        setError(response.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch solutions';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Create new solution
  const createSolution = async (solutionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.createSolution(solutionData);
      
      if (response.success) {
        // Add new solution to the beginning of the list
        setSolutions(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create solution';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get single solution
  const getSolution = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.getSolution(id);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch solution';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update solution
  const updateSolution = async (id, solutionData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.updateSolution(id, solutionData);
      
      if (response.success) {
        // Update solution in the list
        setSolutions(prev => 
          prev.map(solution => 
            solution._id === id ? response.data : solution
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update solution';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Delete solution
  const deleteSolution = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.deleteSolution(id);
      
      if (response.success) {
        // Remove solution from the list
        setSolutions(prev => prev.filter(solution => solution._id !== id));
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete solution';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Analyze code
  const analyzeCode = async (codeData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.analyzeCode(codeData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to analyze code';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get user's solutions
  const getMySolutions = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await solutionsAPI.getMySolutions(params);
      
      if (response.success) {
        setSolutions(response.data);
        setPagination(response.pagination || {});
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your solutions';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    solutions,
    loading,
    error,
    pagination,
    fetchSolutions,
    createSolution,
    getSolution,
    updateSolution,
    deleteSolution,
    analyzeCode,
    getMySolutions,
    clearError
  };
}; 