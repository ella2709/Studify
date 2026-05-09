const messages = {
  welcome: {
    title: "Welcome to Studify",
  },
  general: {
    loading: "Loading...",
    refresh: "Refresh",
    error: "Something went wrong",
    success: "Operation completed successfully",
  },

  upload: {
    title: "Upload Study Material",
    description:
      "You can upload text files such as txt / md / json / csv.",
    selectFiles: "Select files",
    selectedFiles: "Selected files:",
    uploadButton: "Upload files",
    uploading: "Uploading files...",
    noFilesSelected: "Please select at least one file",
    uploadSuccess: "Files uploaded successfully",
    uploadError: "File upload failed",
    emptyList: "No files uploaded yet.",
    uploadedFilesTitle: "Uploaded files",
    fileSize: "Size",
    fileType: "Type",
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
    },

  summarize: {
  title: "Summary of Study Material",
  description: "Generate a summary based on a specific topic from your uploaded materials",
  
  topicLabel: "Topic",
  topicPlaceholder: "Write what you want to summarize...",
  missingTopic: "Please enter a topic for the summary",

  button: "Summarize",
  loading: "Generating summary...",
  error: "Summarization failed",

  sourcesTitle: "Based on files:",

  noUploadedFiles: "No uploaded files available",
  emptyMaterial: "The selected file is empty",
  },
};

export default messages;