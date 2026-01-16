import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { IconArticle } from "@tabler/icons-react";

export default function Blog() {
  return (
    <DefaultLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <IconArticle size={32} />
                    <h1 className="text-3xl font-bold">Blog</h1>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Coming Soon</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                We're working on bringing you exciting content about skill sharing, learning strategies, and student success stories.
                                Stay tuned for our upcoming blog posts and more!
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">What to Expect:</h3>
                                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                                    <li>Development updates and behind-the-scenes insights</li>
                                    <li>Tips for effective skill exchange</li>
                                    <li>Student success stories</li>
                                    <li>Feature announcements and tutorials</li>
                                </ul>
                            </div>
                        </div>
                    </CardBody>
                </Card>
        </div>
    </DefaultLayout>
  );
}
