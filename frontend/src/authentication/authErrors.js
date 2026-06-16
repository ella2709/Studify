import messages from "../messages";

export function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return messages.authErrors.emailAlreadyInUse;

    case "auth/weak-password":
      return messages.authErrors.weakPassword;

    case "auth/invalid-credential":
      return messages.authErrors.invalidCredential;

    case "auth/user-not-found":
      return messages.authErrors.userNotFound;

    case "auth/wrong-password":
      return messages.authErrors.wrongPassword;

    case "auth/invalid-email":
      return messages.authErrors.invalidEmail;

    case "auth/missing-email":
      return messages.authErrors.missingEmail;

    case "auth/missing-password":
      return messages.authErrors.missingPassword;

    case "auth/network-request-failed":
      return messages.authErrors.networkError;

    case "auth/too-many-requests":
      return messages.authErrors.tooManyRequests;

    default:
      return messages.authErrors.default;
  }
}