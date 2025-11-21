import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-paper p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 font-mukta mb-3">
                            काहीतरी चूक झाली
                        </h2>
                        <p className="text-gray-600 mb-6">
                            कृपया पुन्हा प्रयत्न करा किंवा पेज रीफ्रेश करा
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-gradient-to-r from-saffron to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                        >
                            पेज रीफ्रेश करा
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
