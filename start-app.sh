#!/bin/bash

echo "🚀 Starting Property Platform Application..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start Backend
echo "🔧 Starting Backend..."
cd backend
if check_port 3001; then
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
else
    echo "❌ Backend port 3001 is busy"
    exit 1
fi

# Wait for backend to start
sleep 5

# Start Frontend
echo "🎨 Starting Frontend..."
cd ../frontend
if check_port 5173; then
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend port 5173 is busy"
    exit 1
fi

# Wait for frontend to start
sleep 5

echo ""
echo "🎉 Application Started Successfully!"
echo "=================================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo "📊 Health:   http://localhost:3001/health"
echo ""
echo "📝 To stop the application, run: pkill -f 'npm run dev'"
echo ""

# Keep script running
wait 