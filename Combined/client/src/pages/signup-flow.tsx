import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { Switch } from "@nextui-org/switch";
import { Select, SelectItem } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignUp, SignUpWithGoogle } from "@/api/email";
import { MemberType } from "@/types/membertypes";
import { Skill } from "@/types/membertypes";
import { ValidateEmail, ValidatePassword } from "@/api/validate";
import { IconArrowRight, IconArrowLeft, IconCheck, IconPlus, IconX, IconMail, IconKey, IconUpload, IconBrandGoogle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/api/config";
import { updateDoc, doc } from "firebase/firestore";

const SKILL_CATEGORIES = [
    "Technology",
    "Design",
    "Business",
    "Language",
    "Music",
    "Art",
    "Sports",
    "Cooking",
    "Writing",
    "Other",
];

const PROFICIENCY_LEVELS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
];

type Step = "personal" | "skills-offered" | "skills-sought" | "privacy";

export default function SignupFlow() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>("personal");
    const [submitting, setSubmitting] = useState(false);

    // Personal Details
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [staySignedIn, setStaySignedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [passwordInvalid, setPasswordInvalid] = useState(false);

    // Skills Offered
    const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("");
    const [newSkillProficiency, setNewSkillProficiency] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");

    // Skills Sought
    const [skillsSought, setSkillsSought] = useState<Skill[]>([]);
    const [newSoughtSkillName, setNewSoughtSkillName] = useState("");
    const [newSoughtSkillCategory, setNewSoughtSkillCategory] = useState("");
    const [newSoughtSkillProficiency, setNewSoughtSkillProficiency] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");

    // Privacy
    const [privacyMode, setPrivacyMode] = useState(false);
    const [hideProfile, setHideProfile] = useState(false);
    const [restrictMessaging, setRestrictMessaging] = useState(false);
    const [hideContactInfo, setHideContactInfo] = useState(false);

    const [memberType] = useState<MemberType>(MemberType.TeamMember);

    const validatePersonalDetails = () => {
        const emailValid = email.length > 0 && ValidateEmail(email);
        const passwordValid = password.length > 0 && ValidatePassword(password);
        return firstName.length > 0 && lastName.length > 0 && emailValid && passwordValid;
    };

    const addSkillOffered = () => {
        if (!newSkillName.trim() || !newSkillCategory) return;
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: newSkillName,
            category: newSkillCategory,
            proficiency: newSkillProficiency,
            description: "",
        };
        setSkillsOffered([...skillsOffered, newSkill]);
        setNewSkillName("");
        setNewSkillCategory("");
        setNewSkillProficiency("beginner");
    };

    const addSkillSought = () => {
        if (!newSoughtSkillName.trim() || !newSoughtSkillCategory) return;
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: newSoughtSkillName,
            category: newSoughtSkillCategory,
            proficiency: newSoughtSkillProficiency,
            description: "",
        };
        setSkillsSought([...skillsSought, newSkill]);
        setNewSoughtSkillName("");
        setNewSoughtSkillCategory("");
        setNewSoughtSkillProficiency("beginner");
    };

    const removeSkill = (id: string, type: "offered" | "sought") => {
        if (type === "offered") {
            setSkillsOffered(skillsOffered.filter(s => s.id !== id));
        } else {
            setSkillsSought(skillsSought.filter(s => s.id !== id));
        }
    };

    const handleFinalSubmit = async () => {
        try {
            setSubmitting(true);
            const result = await SignUp(
                email,
                firstName + " " + lastName,
                password,
                staySignedIn,
                memberType
            );
            
            if (result.error) {
                toast.error(result.msg);
                setSubmitting(false);
                return;
            }

            // Save profile data after successful signup
            const user = auth.currentUser;
            if (user) {
                try {
                    await updateDoc(doc(db, "users", user.uid), {
                        displayName: firstName + " " + lastName,
                        skillsOffered: skillsOffered,
                        skillsSought: skillsSought,
                        privacyMode: privacyMode,
                        hideProfile: hideProfile,
                        restrictMessaging: restrictMessaging,
                        hideContactInfo: hideContactInfo,
                    });
                } catch (e) {
                    console.error("Error saving profile:", e);
                    // Continue anyway
                }
            }

            toast.success("Successfully signed up!");
            navigate("/dashboard");
        } catch (error) {
            toast.error("An unexpected error occurred");
            setSubmitting(false);
        }
    };

    const steps: { key: Step; title: string }[] = [
        { key: "personal", title: "Personal Details" },
        { key: "skills-offered", title: "Skills Offered" },
        { key: "skills-sought", title: "Skills Sought" },
        { key: "privacy", title: "Privacy Settings" },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === currentStep);

    return (
        <DefaultLayout>
            <ToastContainer />
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
                <Card>
                    <CardHeader>
                        <div style={{ width: "100%" }}>
                            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
                                Create Your Account
                            </h1>
                            {/* Progress Steps */}
                            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                                {steps.map((step, idx) => (
                                    <div
                                        key={step.key}
                                        style={{
                                            flex: 1,
                                            height: "4px",
                                            background: idx <= currentStepIndex
                                                ? "linear-gradient(90deg, #38b6ff, #0099e6)"
                                                : "#e5e7eb",
                                            borderRadius: "2px",
                                            transition: "background 0.3s ease",
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#666" }}>
                                {steps.map((step, idx) => (
                                    <span
                                        key={step.key}
                                        style={{
                                            fontWeight: idx === currentStepIndex ? "600" : "normal",
                                            color: idx <= currentStepIndex ? "#38b6ff" : "#999",
                                        }}
                                    >
                                        {step.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody style={{ minHeight: "500px", padding: "40px" }}>
                        {/* Step 1: Personal Details */}
                        {currentStep === "personal" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
                                    Personal Information
                                </h2>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <Input
                                        label="First Name"
                                        value={firstName}
                                        onValueChange={setFirstName}
                                        placeholder="John"
                                        variant="bordered"
                                        isRequired
                                    />
                                    <Input
                                        label="Last Name"
                                        value={lastName}
                                        onValueChange={setLastName}
                                        placeholder="Doe"
                                        variant="bordered"
                                        isRequired
                                    />
                                </div>
                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onValueChange={(val) => {
                                        setEmail(val);
                                        setEmailInvalid(val.length > 0 && !ValidateEmail(val));
                                    }}
                                    isInvalid={emailInvalid}
                                    errorMessage={emailInvalid ? "Please enter a valid email" : ""}
                                    placeholder="example@email.com"
                                    variant="bordered"
                                    isRequired
                                    startContent={<IconMail size={18} />}
                                />
                                <Input
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onValueChange={(val) => {
                                        setPassword(val);
                                        setPasswordInvalid(val.length > 0 && !ValidatePassword(val));
                                    }}
                                    isInvalid={passwordInvalid}
                                    errorMessage={passwordInvalid ? "Password must be 8-16 characters with a number and special character" : ""}
                                    placeholder="********"
                                    variant="bordered"
                                    isRequired
                                    startContent={<IconKey size={18} />}
                                />
                                <Checkbox
                                    checked={staySignedIn}
                                    onValueChange={setStaySignedIn}
                                >
                                    Keep me signed in
                                </Checkbox>
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                                    <Button
                                        style={{
                                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                            color: "white"
                                        }}
                                        onPress={() => {
                                            if (validatePersonalDetails()) {
                                                setCurrentStep("skills-offered");
                                            } else {
                                                toast.error("Please fill in all required fields correctly");
                                            }
                                        }}
                                        endContent={<IconArrowRight size={18} />}
                                    >
                                        Next: Skills Offered
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Skills Offered */}
                        {currentStep === "skills-offered" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
                                    Skills You Can Teach
                                </h2>
                                <p style={{ color: "#666", marginBottom: "10px" }}>
                                    List the skills you're comfortable teaching to others. You can add more later.
                                </p>
                                
                                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                    <Input
                                        placeholder="Skill name (e.g., JavaScript)"
                                        value={newSkillName}
                                        onValueChange={setNewSkillName}
                                        style={{ flex: 1 }}
                                        variant="bordered"
                                    />
                                    <Select
                                        placeholder="Category"
                                        selectedKeys={newSkillCategory ? [newSkillCategory] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setNewSkillCategory(selected || "");
                                        }}
                                        style={{ width: "150px" }}
                                        variant="bordered"
                                    >
                                        {SKILL_CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        placeholder="Level"
                                        selectedKeys={[newSkillProficiency]}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setNewSkillProficiency(selected as any);
                                        }}
                                        style={{ width: "120px" }}
                                        variant="bordered"
                                    >
                                        {PROFICIENCY_LEVELS.map(level => (
                                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                        ))}
                                    </Select>
                                    <Button
                                        isIconOnly
                                        style={{
                                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                            color: "white"
                                        }}
                                        onPress={addSkillOffered}
                                    >
                                        <IconPlus size={18} />
                                    </Button>
                                </div>

                                {skillsOffered.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                                        {skillsOffered.map(skill => (
                                            <div
                                                key={skill.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "6px 12px",
                                                    background: "#f0f0f0",
                                                    borderRadius: "16px",
                                                    fontSize: "14px"
                                                }}
                                            >
                                                <span><strong>{skill.name}</strong> ({skill.category})</span>
                                                <button
                                                    onClick={() => removeSkill(skill.id, "offered")}
                                                    style={{ cursor: "pointer", background: "none", border: "none", color: "#666" }}
                                                >
                                                    <IconX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "20px" }}>
                                    <Button
                                        variant="bordered"
                                        onPress={() => setCurrentStep("personal")}
                                        startContent={<IconArrowLeft size={18} />}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        style={{
                                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                            color: "white"
                                        }}
                                        onPress={() => setCurrentStep("skills-sought")}
                                        endContent={<IconArrowRight size={18} />}
                                    >
                                        Next: Skills Sought
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Skills Sought */}
                        {currentStep === "skills-sought" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
                                    Skills You Want to Learn
                                </h2>
                                <p style={{ color: "#666", marginBottom: "10px" }}>
                                    List the skills you're interested in learning. This helps match you with the right partners.
                                </p>
                                
                                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                    <Input
                                        placeholder="Skill name (e.g., Piano)"
                                        value={newSoughtSkillName}
                                        onValueChange={setNewSoughtSkillName}
                                        style={{ flex: 1 }}
                                        variant="bordered"
                                    />
                                    <Select
                                        placeholder="Category"
                                        selectedKeys={newSoughtSkillCategory ? [newSoughtSkillCategory] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setNewSoughtSkillCategory(selected || "");
                                        }}
                                        style={{ width: "150px" }}
                                        variant="bordered"
                                    >
                                        {SKILL_CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        placeholder="Level"
                                        selectedKeys={[newSoughtSkillProficiency]}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setNewSoughtSkillProficiency(selected as any);
                                        }}
                                        style={{ width: "120px" }}
                                        variant="bordered"
                                    >
                                        {PROFICIENCY_LEVELS.map(level => (
                                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                        ))}
                                    </Select>
                                    <Button
                                        isIconOnly
                                        style={{
                                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                            color: "white"
                                        }}
                                        onPress={addSkillSought}
                                    >
                                        <IconPlus size={18} />
                                    </Button>
                                </div>

                                {skillsSought.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                                        {skillsSought.map(skill => (
                                            <div
                                                key={skill.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "6px 12px",
                                                    background: "#f0f0f0",
                                                    borderRadius: "16px",
                                                    fontSize: "14px"
                                                }}
                                            >
                                                <span><strong>{skill.name}</strong> ({skill.category})</span>
                                                <button
                                                    onClick={() => removeSkill(skill.id, "sought")}
                                                    style={{ cursor: "pointer", background: "none", border: "none", color: "#666" }}
                                                >
                                                    <IconX size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "20px" }}>
                                    <Button
                                        variant="bordered"
                                        onPress={() => setCurrentStep("skills-offered")}
                                        startContent={<IconArrowLeft size={18} />}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        style={{
                                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                            color: "white"
                                        }}
                                        onPress={() => setCurrentStep("privacy")}
                                        endContent={<IconArrowRight size={18} />}
                                    >
                                        Next: Privacy Settings
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Privacy */}
                        {currentStep === "privacy" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
                                    Privacy Settings
                                </h2>
                                <p style={{ color: "#666", marginBottom: "20px" }}>
                                    Configure your privacy preferences. You can change these anytime in your profile.
                                </p>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f9f9f9", borderRadius: "12px" }}>
                                        <div>
                                            <h4 style={{ fontWeight: "600", marginBottom: "4px" }}>Enhanced Privacy Mode</h4>
                                            <p style={{ fontSize: "14px", color: "#666" }}>Extra protection for younger users</p>
                                        </div>
                                        <Switch isSelected={privacyMode} onValueChange={setPrivacyMode} />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f9f9f9", borderRadius: "12px" }}>
                                        <div>
                                            <h4 style={{ fontWeight: "600", marginBottom: "4px" }}>Hide Profile from Search</h4>
                                            <p style={{ fontSize: "14px", color: "#666" }}>Your profile won't appear in search results</p>
                                        </div>
                                        <Switch isSelected={hideProfile} onValueChange={setHideProfile} />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f9f9f9", borderRadius: "12px" }}>
                                        <div>
                                            <h4 style={{ fontWeight: "600", marginBottom: "4px" }}>Restrict Messaging</h4>
                                            <p style={{ fontSize: "14px", color: "#666" }}>Only accept messages from session partners</p>
                                        </div>
                                        <Switch isSelected={restrictMessaging} onValueChange={setRestrictMessaging} />
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f9f9f9", borderRadius: "12px" }}>
                                        <div>
                                            <h4 style={{ fontWeight: "600", marginBottom: "4px" }}>Hide Contact Information</h4>
                                            <p style={{ fontSize: "14px", color: "#666" }}>Keep email, phone, and location private</p>
                                        </div>
                                        <Switch isSelected={hideContactInfo} onValueChange={setHideContactInfo} />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "20px" }}>
                                    <Button
                                        variant="bordered"
                                        onPress={() => setCurrentStep("skills-sought")}
                                        startContent={<IconArrowLeft size={18} />}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        style={{
                                            background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                            color: "white"
                                        }}
                                        onPress={handleFinalSubmit}
                                        isLoading={submitting}
                                        endContent={<IconCheck size={18} />}
                                    >
                                        Complete Sign Up
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}
