import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { IconStar } from "@tabler/icons-react";
import { createRating, CreateRatingParams } from "@/api/rating";
import { toast } from "react-toastify";
import { auth } from "@/api/config";
import { onAuthStateChanged } from "firebase/auth";

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionRequestId: string;
    rateeId: string;
    rateeName: string;
    skillId: string;
    skillName: string;
    onRatingSubmitted: () => void;
}

export default function RatingModal({
    isOpen,
    onClose,
    sessionRequestId,
    rateeId,
    rateeName,
    skillId,
    skillName,
    onRatingSubmitted
}: RatingModalProps) {
    const [rating, setRating] = useState<string>("5");
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to submit a rating");
            return;
        }

        setSubmitting(true);
        const params: CreateRatingParams = {
            sessionRequestId,
            rateeId,
            rateeName,
            skillId,
            skillName,
            rating: parseInt(rating),
            feedback: feedback.trim() || undefined
        };

        const result = await createRating(params, user.uid, user.displayName || "Anonymous");
        setSubmitting(false);

        if (result.error) {
            toast.error(result.msg || "Failed to submit rating");
        } else {
            toast.success("Rating submitted successfully!");
            setRating("5");
            setFeedback("");
            onRatingSubmitted();
            onClose();
        }
    };

    const stars = [1, 2, 3, 4, 5];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Rate Your Exchange Session
                </ModalHeader>
                <ModalBody>
                    <div>
                        <p className="mb-4">
                            How was your session with <strong>{rateeName}</strong> for <strong>{skillName}</strong>?
                        </p>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <div className="flex gap-2">
                                {stars.map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star.toString())}
                                        className={`p-2 rounded transition-all ${
                                            parseInt(rating) >= star
                                                ? "text-yellow-400 scale-110"
                                                : "text-gray-300"
                                        }`}
                                    >
                                        <IconStar
                                            size={40}
                                            fill={parseInt(rating) >= star ? "currentColor" : "none"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Selected: {rating} out of 5 stars
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
                            <Textarea
                                placeholder="Share your experience and any feedback..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                minRows={4}
                                maxRows={8}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="default" variant="light" onPress={onClose} isDisabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        style={{
                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                            color: "white"
                        }}
                        onPress={handleSubmit}
                        isLoading={submitting}
                    >
                        Submit Rating
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
