export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Access Denied
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>
                                    Invalid or missing access key. Please ensure you have the correct URL.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 