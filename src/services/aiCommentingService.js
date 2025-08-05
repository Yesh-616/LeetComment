// Advanced AI Commenting Service with Better Logic Explanation

export const analyzeCodeApproach = (code, _language) => {
  const lowerCode = code.toLowerCase();
  
  // Enhanced algorithm detection with better explanations
  let algorithmType = 'General Solution';
  let approach = '';
  let keyInsights = [];
  let optimizations = [];
  
  // Meeting room scheduling pattern
  if (lowerCode.includes('meeting') || (lowerCode.includes('sort') && lowerCode.includes('time'))) {
    algorithmType = 'Greedy + Priority Queue';
    approach = 'Sort meetings by start time, then greedily assign rooms using availability tracking';
    keyInsights = [
      'Sorting ensures we process meetings in chronological order',
      'Tracking room availability prevents conflicts',
      'Greedy assignment to earliest available room is optimal'
    ];
    optimizations = [
      'Use priority queue for O(log n) room selection instead of O(n) linear search',
      'Consider using TreeMap for better time complexity in room management'
    ];
  }
  // Two pointers pattern
  else if ((lowerCode.includes('left') && lowerCode.includes('right')) || 
           (lowerCode.includes('start') && lowerCode.includes('end'))) {
    algorithmType = 'Two Pointers';
    approach = 'Use two pointers moving towards each other to efficiently explore solution space';
    keyInsights = [
      'Two pointers eliminate need for nested loops',
      'Works best on sorted arrays or when searching for pairs',
      'Reduces time complexity from O(n²) to O(n)'
    ];
  }
  // Dynamic Programming
  else if (lowerCode.includes('dp') || lowerCode.includes('memo') || 
           (lowerCode.includes('for') && lowerCode.includes('for') && lowerCode.includes('max'))) {
    algorithmType = 'Dynamic Programming';
    approach = 'Break problem into subproblems and store results to avoid recomputation';
    keyInsights = [
      'Overlapping subproblems make memoization beneficial',
      'Optimal substructure allows building solution bottom-up',
      'Trade space for time to achieve polynomial complexity'
    ];
  }
  // Sliding Window
  else if (lowerCode.includes('window') || 
           (lowerCode.includes('while') && lowerCode.includes('expand'))) {
    algorithmType = 'Sliding Window';
    approach = 'Maintain a window of elements and slide it to find optimal subarray/substring';
    keyInsights = [
      'Window expands and contracts based on conditions',
      'Avoids recalculating overlapping portions',
      'Particularly effective for substring/subarray problems'
    ];
  }
  // Binary Search
  else if (lowerCode.includes('binary') || 
           (lowerCode.includes('mid') && lowerCode.includes('left') && lowerCode.includes('right'))) {
    algorithmType = 'Binary Search';
    approach = 'Divide search space in half repeatedly to find target efficiently';
    keyInsights = [
      'Requires sorted data or monotonic property',
      'Eliminates half of possibilities each iteration',
      'Achieves O(log n) time complexity'
    ];
  }
  // Graph traversal
  else if (lowerCode.includes('dfs') || lowerCode.includes('bfs') || 
           lowerCode.includes('visited') || lowerCode.includes('queue')) {
    algorithmType = lowerCode.includes('bfs') ? 'Breadth-First Search' : 'Depth-First Search';
    approach = algorithmType === 'Breadth-First Search' 
      ? 'Explore nodes level by level using queue for shortest path'
      : 'Explore as far as possible along each branch before backtracking';
    keyInsights = [
      algorithmType === 'Breadth-First Search' 
        ? 'BFS guarantees shortest path in unweighted graphs'
        : 'DFS uses less memory and good for detecting cycles',
      'Visited array prevents infinite loops',
      'Time complexity is O(V + E) for graphs'
    ];
  }
  
  // Complexity analysis
  let timeComplexity = 'O(n)';
  let spaceComplexity = 'O(1)';
  
  const loops = (code.match(/for|while/g) || []).length;
  if (loops >= 2 && !lowerCode.includes('sort')) {
    timeComplexity = 'O(n²)';
  } else if (lowerCode.includes('sort')) {
    timeComplexity = 'O(n log n)';
  } else if (lowerCode.includes('binary') && lowerCode.includes('search')) {
    timeComplexity = 'O(log n)';
  }
  
  if (lowerCode.includes('array') || lowerCode.includes('map') || lowerCode.includes('set')) {
    spaceComplexity = 'O(n)';
  }
  
  return {
    approach,
    algorithmType,
    timeComplexity,
    spaceComplexity,
    keyInsights,
    optimizations
  };
};

export const generateAdvancedComments = (code, language) => {
  const lines = code.split('\n');
  const commentedLines = [];
  const analysis = analyzeCodeApproach(code, language);
  
  // Add comprehensive header
  commentedLines.push(`/**`);
  commentedLines.push(` * PROBLEM APPROACH: ${analysis.approach}`);
  commentedLines.push(` * ALGORITHM TYPE: ${analysis.algorithmType}`);
  commentedLines.push(` * TIME COMPLEXITY: ${analysis.timeComplexity}`);
  commentedLines.push(` * SPACE COMPLEXITY: ${analysis.spaceComplexity}`);
  commentedLines.push(` * `);
  commentedLines.push(` * KEY STRATEGY:`);
  analysis.keyInsights.forEach(insight => {
    commentedLines.push(` * - ${insight}`);
  });
  commentedLines.push(` */`);
  commentedLines.push('');
  
  let currentSection = '';
  
  lines.forEach((line, _index) => {
    const trimmedLine = line.trim();
    const indent = ' '.repeat(line.length - trimmedLine.length);
    
    // Class/function declarations
    if (trimmedLine.includes('class ') || trimmedLine.includes('public ') || trimmedLine.includes('function')) {
      commentedLines.push(`${indent}// SOLUTION CLASS: Main implementation of the algorithm`);
      commentedLines.push(line);
      currentSection = 'function';
    }
    // Variable initialization with context
    else if (trimmedLine.includes('=') && !trimmedLine.includes('==') && !trimmedLine.includes('for')) {
      if (trimmedLine.includes('[]') || trimmedLine.includes('new int')) {
        commentedLines.push(`${indent}// DATA STRUCTURE: Initialize arrays to track state`);
        commentedLines.push(line);
        if (trimmedLine.includes('ans') || trimmedLine.includes('result')) {
          commentedLines.push(`${indent}// PURPOSE: Store final results/counts for each element`);
        } else if (trimmedLine.includes('time') || trimmedLine.includes('available')) {
          commentedLines.push(`${indent}// PURPOSE: Track availability/timing information`);
        }
      } else {
        commentedLines.push(line);
        if (trimmedLine.includes('false') || trimmedLine.includes('true')) {
          commentedLines.push(`${indent}// FLAG: Boolean to control algorithm flow`);
        } else if (trimmedLine.includes('MAX_VALUE') || trimmedLine.includes('MIN_VALUE')) {
          commentedLines.push(`${indent}// SENTINEL: Use extreme value for comparison logic`);
        }
      }
    }
    // Sorting operations
    else if (trimmedLine.includes('sort') || trimmedLine.includes('Sort')) {
      commentedLines.push(`${indent}// PREPROCESSING: Sort data to enable greedy/optimal processing`);
      commentedLines.push(line);
      commentedLines.push(`${indent}// WHY SORT: Processing in order ensures we make optimal decisions`);
    }
    // Main processing loops
    else if (trimmedLine.includes('for') && trimmedLine.includes('meetings')) {
      commentedLines.push(`${indent}// MAIN ALGORITHM: Process each meeting in chronological order`);
      commentedLines.push(line);
      currentSection = 'main_loop';
    }
    else if (trimmedLine.includes('for') && currentSection === 'main_loop') {
      commentedLines.push(`${indent}// ROOM SEARCH: Find best available room for current meeting`);
      commentedLines.push(line);
    }
    // Conditional logic with strategic explanation
    else if (trimmedLine.includes('if') && trimmedLine.includes('<=')) {
      commentedLines.push(`${indent}// AVAILABILITY CHECK: Is room free when meeting starts?`);
      commentedLines.push(line);
    }
    else if (trimmedLine.includes('if') && trimmedLine.includes('<') && trimmedLine.includes('val')) {
      commentedLines.push(`${indent}// OPTIMIZATION: Track room that becomes available earliest`);
      commentedLines.push(line);
    }
    else if (trimmedLine.includes('if') && trimmedLine.includes('!flag')) {
      commentedLines.push(`${indent}// FALLBACK STRATEGY: No room available, use earliest available`);
      commentedLines.push(line);
    }
    // Key operations
    else if (trimmedLine.includes('++') || trimmedLine.includes('+=')) {
      commentedLines.push(line);
      commentedLines.push(`${indent}// BOOKING: Assign meeting to this room and update counters`);
    }
    else if (trimmedLine.includes('break')) {
      commentedLines.push(line);
      commentedLines.push(`${indent}// EFFICIENCY: Found suitable room, no need to check others`);
    }
    // Return logic
    else if (trimmedLine.includes('return')) {
      commentedLines.push(`${indent}// FINAL RESULT: Return the room with maximum bookings`);
      commentedLines.push(line);
    }
    // Default case
    else {
      commentedLines.push(line);
    }
  });
  
  return commentedLines.join('\n');
};

export const generateOptimizedSolution = (code, language) => {
  const analysis = analyzeCodeApproach(code, language);
  
  // Generate optimized version based on detected patterns
  let optimizedCode = '';
  let improvements = [];
  let complexityImprovement = { time: analysis.timeComplexity, space: analysis.spaceComplexity };
  
  if (code.includes('meetings') && code.includes('times')) {
    // Meeting room optimization
    optimizedCode = `class Solution {
    public int mostBooked(int n, int[][] meetings) {
        // OPTIMIZED APPROACH: Use PriorityQueue for efficient room management
        int[] bookingCount = new int[n];
        PriorityQueue<Integer> availableRooms = new PriorityQueue<>();
        PriorityQueue<long[]> busyRooms = new PriorityQueue<>((a, b) -> 
            a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
        
        // Initialize all rooms as available
        for (int i = 0; i < n; i++) {
            availableRooms.offer(i);
        }
        
        Arrays.sort(meetings, (a, b) -> Integer.compare(a[0], b[0]));
        
        for (int[] meeting : meetings) {
            long start = meeting[0], end = meeting[1];
            
            // Free up rooms that have finished their meetings
            while (!busyRooms.isEmpty() && busyRooms.peek()[0] <= start) {
                availableRooms.offer((int) busyRooms.poll()[1]);
            }
            
            if (!availableRooms.isEmpty()) {
                // Room available at meeting start time
                int room = availableRooms.poll();
                bookingCount[room]++;
                busyRooms.offer(new long[]{end, room});
            } else {
                // All rooms busy, use the one that frees up earliest
                long[] earliest = busyRooms.poll();
                int room = (int) earliest[1];
                bookingCount[room]++;
                busyRooms.offer(new long[]{earliest[0] + (end - start), room});
            }
        }
        
        // Find room with maximum bookings
        int maxBookings = 0, result = 0;
        for (int i = 0; i < n; i++) {
            if (bookingCount[i] > maxBookings) {
                maxBookings = bookingCount[i];
                result = i;
            }
        }
        return result;
    }
}`;
    
    improvements = [
      'Replaced O(n) linear search with O(log n) priority queue operations',
      'Used two priority queues to efficiently manage available and busy rooms',
      'Eliminated redundant room availability tracking',
      'Improved room selection logic with automatic sorting'
    ];
    
    complexityImprovement = {
      time: 'O(m log n) - improved from O(m × n)',
      space: 'O(n) - same but more efficient usage'
    };
  }
  
  return {
    code: optimizedCode || code,
    improvements,
    complexityImprovement
  };
}; 