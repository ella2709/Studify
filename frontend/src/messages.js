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
    question: "What will we study today?"

  },

  projects: {
    myProjects: "My Projects",
    create: "Create Project",
    createNew: "create new project",
    createFirst:"Create your first project to start uploading materials and studying with AI.",
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
    supportedFiles: "Supported: PDF, Word, Excel, PowerPoint, text and code files",
    selectedFiles: "Selected files",
    noStudyMaterials: "No study files yet",
    noStudyMaterialsDescription: "Select files above and upload them to start using this project",
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
    chat: "Select an existing chat from the right, or create a new one to begin asking questions.",
    chatsTitle: "Question Chats",
    chatsSubTitle: "Create or continue chats.",
    startConversation: "Start a conversation",
    noChats: "No chats yet",
  },

  summarize: {
    title: "Summary of Study Material",
    description: "Generate a summary based on a specific topic from your uploaded materials",
    topicLabel: "Topic",
    missingTopic: "Please enter a topic for the summary",
    loading: "Generating summary...",
    noUploadedFiles: "No uploaded files available",
    emptyMaterial: "The selected file is empty",
    missingFields: "Please enter a topic",
    topicPlaceholder: "Write a topic to summarize...",
    submit: "Summarize",
    error: "Failed to generate summary",
    question: "What would you like to summarize?",
    generating: "Generating...",
    generated: "Generated Summary",
    firstSummary: "Generate your first summary above to get started.",
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
  },

  successMessages: {
    deleted: "User permanently deleted successfully",
    resetData: "User data reset successfully",
    blocked: "User blocked successfully",
    unblocked: "User unblocked successfully",
  },

  confirmationMessages: {
    delete: "Are you sure you want to permanently delete this user and all system data? This action cannot be undone.",
    resetData: "Are you sure you want to reset all system data for this user? This action cannot be undone.",
    block: "Are you sure you want to block this user? They will not be able to log in.",
    unblock: "Are you sure you want to unblock this user? They will be able to log in again.",
  },

  pageTitles: {
    admin: "Admin Panel",
    project: "project",
    material: "Study Materials",
    summary: "Summary Generator",
  },

  pagePurposes: {
    admin: "Manage system users, permissions and user data.",
    upload:" Add materials that power your summaries, questions, and AI-based learning.",
    questions: "Ask questions based on your uploaded study materials.",
    summary: "Summarize your materials",

  }

};

export default messages;