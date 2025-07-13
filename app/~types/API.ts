export type RefreshProfileResponse = {
  success: boolean;
  message: string;
};

type SuccessResponse = {
  success: true;
  message: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

export type APIResponse = SuccessResponse | ErrorResponse;
