const messages = {
  general: {
    loading: "Loading...",
    refresh: "Refresh",
    error: "Something went wrong",
    success: "Operation completed successfully",
    loadingUsers: "Loading users...",
    noUsers: "No users found",
  },

  actions: {
    unblock: "Unblock",
    block: "Block",
    blocked: "Blocked",
    delete: "Delete",
    deleted: "Deleted",
    resetData: "Reset Data",
    active: "Active",
    clearAll: "Clear All",
    cancel: "Cancel",
  },

  actionsTitle: {
    resetData: "Reset user data",
    delete: "Permanently delete user",
    block: "Block user",
    unblock: "Unblock user",
  },

  roles: {
    admin: "Admin",
    student: "Student",
  },

  welcome: {
    studify: "Studify",
    tagline: "AI Study Assistant",
    title: "Welcome to Studify",
    hello: "Hello",
    question: "What will we study today?",
  },

  projects: {
    myProjects: "My Projects",
    create: "Create Project",
    createNew: "Create new project",
    createFirst:
      "Create your first project to start uploading materials and studying with AI.",
    noProjects: "No projects yet",
    noMatchingProjects: "No matching projects",
    differentName: "Try a different project name.",
    allProjects: "All Projects",
  },

  upload: {
    title: "Upload Study Material",
    description: "You can upload text files such as txt / md / json / csv.",
    selectFiles: "Select files",
    uploadButton: "Upload files",
    uploading: "Uploading files...",
    noFilesSelected: "Please select at least one file",
    uploadSuccess: "Files uploaded successfully",
    uploadError: "File upload failed",
    emptyList: "No files uploaded yet.",
    uploadedFilesTitle: "Uploaded files",
    fileSize: "Size",
    fileType: "Type",
    chooseTool: "Choose a tool to work with your study materials.",
    chooseFiles: "Choose files to upload",
    supportedFiles:
      "Supported: PDF, Word, Excel, PowerPoint, text and code files",
    selectedFiles: "Selected files",
    noStudyMaterials: "No study files yet",
    noStudyMaterialsDescription:
      "Select files above and upload them to start using this project",
    manageTitle: "Upload & manage files",
    uploadedCountEmpty: "No files have been uploaded yet.",
    fileDeleted: "File deleted successfully",
    deleteFailed: "Failed to delete file",
    removeFile: "Remove file",
    deleteFileTitle: "Delete file?",
    deleteFileMessage: (fileName) =>
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
  },

  askAi: {
    title: "Ask AI",
    description: "Choose an uploaded file and ask a question about it.",
    materialLabel: "Uploaded file",
    questionLabel: "Question",
    questionPlaceholder: "Write a question about the file...",
    submit: "Ask the AI",
    loading: "Sending...",
    missingFields: "Please choose a file and enter a question",
    error: "Something went wrong",
    answerTitle: "AI Answer:",
    noUploadedFiles: "No uploaded files available",
    emptyMaterial: "The selected file is empty",
    newChat: "+ New chat",
    chat:
      "Select an existing chat from the right, or create a new one to begin asking questions.",
    chatsTitle: "Question Chats",
    chatsSubTitle: "Create or continue chats.",
    startConversation: "Start a conversation",
    noChats: "No chats yet",
    missingChatTitle: "Please enter a chat title",
    chooseChatFirst: "Please choose or create a chat first",
    createChatFailed: "Failed to create chat",
    loadMessagesFailed: "Failed to load chat messages",
    deleteChatFailed: "Failed to delete chat",
    deleteChatTitle: "Delete chat?",
    deleteChatMessage: (chatTitle) =>
      `Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`,
  },

  summarize: {
    title: "Summary of Study Material",
    description:
      "Generate a summary based on a specific topic from your uploaded materials",
    topicLabel: "Topic",
    missingTopic: "Please enter a topic for the summary",
    loading: "Generating summary...",
    noUploadedFiles: "No uploaded files available",
    emptyMaterial: "The selected file is empty",
    missingFields: "Please enter a topic",
    topicPlaceholder: "Write a topic to summarize...",
    submit: "Generate Summary",
    error: "Failed to generate summary",
    question: "What would you like to summarize?",
    generating: "Generating...",
    generated: "Generated Summary",
    firstSummary: "Generate your first summary above to get started.",
    examplePlaceholder:
      "For example: summarize the main ideas from chapter 3...",
    missingInstruction: "Please describe what you want to summarize.",
    noMaterials:
      "No study materials were found for this project. Please upload materials before generating a summary.",
    fileUnavailable: "Summary file is not available for download.",
    history: "Summary History",
    noSummaries: "No summaries yet",
    generatedFallback: "Generated summary",
    ready: "Ready",
    clickToDownload: "Click to download",
  },

  exams: {
    simulator: "Exam Simulator",
    title: "Test your knowledge",
    createNew: "Create New Exam",
    history: "Exam History",
    completedHistory: "Completed Exam History",
    generate: "Generate Exam",
    generating: "Generating...",
    start: "Start Exam",
    retake: "Retake Exam",
    submit: "Submit Exam",
    checking: "Checking...",
    unavailable: "Unavailable",
    noExams: "No exams yet",
    noExamsDescription: "Generate your first exam above to get started.",
    noCompletedExams: "No completed exams",
    noCompletedExamsDescription:
      "There are no completed exams available to review.",
    unavailableTitle: "Exam unavailable in view-only mode",
    unavailableDescription:
      "Only completed exams and their results can be viewed while AI features are unavailable.",
    examType: "Exam Type",
    multipleChoice: "Multiple Choice",
    openQuestions: "Open Questions",
    numberOfQuestions: "Number of Questions",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    examLanguage: "Exam Language",
    english: "English",
    hebrew: "Hebrew",
    questions: "questions",
    back: "Back to Exam Simulator",
    review: "Exam Review",
    grade: "Grade",
    duration: "Duration",
    minutes: "min",
    recommendations: "Recommendations",
    question: "Question",
    yourAnswer: "Your answer:",
    correctAnswer: "Correct answer:",
    correct: "Correct",
    notice: "Notice!",
    missingAnswers: "Some questions are still unanswered.",
    noMaterials:
      "No study materials were found for this project. Please upload materials before creating an exam.",
    notEnoughMaterial:
      "Not enough relevant material was found to create an exam.",
    invalidExam:
      "The system could not generate a valid exam. Please try again.",
    writeAnswer: "Write your answer...",
  },

  aiAccess: {
    dialogTitle: "AI Features Temporarily Unavailable",
    dialogMessage: `The Gemini usage limit has been reached.

You can still view your existing projects, uploaded materials, previous chats, generated summaries, and completed exams.

Uploading materials, asking AI questions, generating summaries, generating exams, and solving exams are temporarily unavailable.`,
    continueButton: "Continue in View-Only Mode",
    viewOnlyTitle: "View-only mode",
    unavailableButton: "AI Unavailable",
    unavailableTooltip: "AI features are temporarily unavailable",
    questionsMessage:
      "You can read and manage existing chats, but creating new chats and asking new AI questions are temporarily unavailable.",
    questionsEmptyMessage:
      "Select an existing chat from the list to read its messages.",
    questionsPlaceholder: "AI questions are temporarily unavailable",
    summariesMessage:
      "You can view and download existing summaries, but generating new summaries is temporarily unavailable.",
    summaryPlaceholder: "Summary generation is temporarily unavailable",
    noExistingSummaries:
      "There are no existing summaries available to view.",
    uploadMessage:
      "You can view, refresh and delete existing files, but uploading new materials is temporarily unavailable.",
    uploadUnavailableTitle: "File Upload Unavailable",
    uploadUnavailableDescription: "Existing files are still available below.",
    uploadTooltip: "Uploading files is temporarily unavailable",
    noExistingMaterials:
      "There are no existing materials available to view.",
    examsMessage:
      "You can view completed exams and their results. Creating, starting, continuing, submitting or retrying exams is temporarily unavailable.",
  },

  registerAndLogin: {
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    createAccount: "Create account",
    newHere: "New here?",
    signIn: "Sign In",
    login: "Login",
    signup: "Sign Up",
    resetPassword: "Reset",
    forgotPassword: "Forgot password? ",
  },

  authErrors: {
    emailAlreadyInUse: "This email is already registered.",
    weakPassword: "Password must be at least 6 characters.",
    invalidCredential: "Incorrect email or password.",
    userNotFound: "No account exists with this email address.",
    wrongPassword: "Incorrect password.",
    invalidEmail: "Please enter a valid email address.",
    missingEmail: "Please enter your email.",
    missingPassword: "Please enter your password.",
    networkError: "Network error. Please check your internet connection.",
    tooManyRequests: "Too many failed attempts. Please try again later.",
    passwordsDoNotMatch: "Passwords do not match.",
    missingName: "Please enter your name.",
    userDisabled: "This account has been blocked by the administrator.",
    default: "Something went wrong. Please try again.",
  },

  errors: {
    accessDenied: "Access denied.",
    adminOnly: "Admin access only.",
    geminiLimit: "AI features are temporarily unavailable.",
  },

  successMessages: {
    deleted: "User permanently deleted successfully",
    resetData: "User data reset successfully",
    blocked: "User blocked successfully",
    unblocked: "User unblocked successfully",
  },

  confirmationMessages: {
    delete:
      "Are you sure you want to permanently delete this user and all system data? This action cannot be undone.",
    resetData:
      "Are you sure you want to reset all system data for this user? This action cannot be undone.",
    block:
      "Are you sure you want to block this user? They will not be able to log in.",
    unblock:
      "Are you sure you want to unblock this user? They will be able to log in again.",
  },

  pageTitles: {
    admin: "Admin Panel",
    project: "Project",
    material: "Study Materials",
    summary: "Summary Generator",
  },

  pagePurposes: {
    admin: "Manage system users, permissions and user data.",
    upload:
      "Add materials that power your summaries, questions, and AI-based learning.",
    questions: "Ask questions based on your uploaded study materials.",
    summary: "Summarize your materials",
  },
};

export default messages;
