export interface BaseResponse {
  status?: boolean;
}

export interface MessageResponse extends BaseResponse {
  message: string;
}

export interface CountResponse extends BaseResponse {
  totalCount?: number;
}

export interface CreatedUpdatedResponse extends BaseResponse {
  id: string;
}

export interface CreatedUpdatedIdArrayResponse extends BaseResponse {
  ids: Array<string>;
}
