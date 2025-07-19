export type RefreshProfileResponse = {
  success: boolean;
  message: string;
};

type SuccessResponse = {
  success: true;
  data: any;
};

type ErrorResponse = {
  success: false;
  error: string;
};

export type APIResponse = SuccessResponse | ErrorResponse;
