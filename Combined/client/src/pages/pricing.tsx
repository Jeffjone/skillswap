import { Link as RouterLink } from "react-router-dom";
import DefaultLayout from "@/layouts/default";

export default function PricingPage() {
    return (
        <DefaultLayout>
            <div className="min-h-screen bg-white dark:bg-black">
                <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Start your skill exchange journey today</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
                        {/* Free Plan Box */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">Free (Beta)</h2>
                                <div className="text-4xl font-bold mb-4">$0</div>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Perfect for trying out SkillSwap</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Skill profile management
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Session scheduling
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Browse and connect with students
                                </li>
                            </ul>
                            <RouterLink to="/portal?tab=Sign Up" className="block w-full">
                                <button
                                    className="w-full py-3 px-6 rounded-full text-white font-bold transition-all duration-200"
                                    style={{
                                        background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.3)";
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                                    }}
                                >
                                    Sign Up
                                </button>
                            </RouterLink>
                        </div>

                        {/* Coming Soon Box */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">Premium</h2>
                                <div className="text-4xl font-bold mb-4">Coming Soon</div>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Advanced features for active learners</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-400">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Advanced analytics
                                </li>
                                <li className="flex items-center text-gray-400">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Advanced skill matching
                                </li>
                                <li className="flex items-center text-gray-400">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Priority support
                                </li>
                            </ul>
                            <button
                                className="w-full py-3 px-6 rounded-full text-gray-400 font-bold bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                                disabled
                            >
                                Coming Soon
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </DefaultLayout>
    );
}
