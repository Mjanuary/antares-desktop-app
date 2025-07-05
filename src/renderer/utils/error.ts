export type ErrorType = {
  error: string;
};

export type FormInputError = {
  target: string;
  message: string;
  parent: string;
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong";
  }
  console.log(message);
  return message;
};

export const catchError = (error: unknown): ErrorType => ({
  error: getErrorMessage(error),
});
