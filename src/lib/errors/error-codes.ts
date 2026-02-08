/**
 * Standardized Error Codes for API Responses
 * Format: RESOURCE_ACTION_REASON
 */
export enum ErrorCode {
  // ========================================
  // AUTHENTICATION & AUTHORIZATION (1xxx)
  // ========================================
  AUTH_REQUIRED = "AUTH_REQUIRED",
  AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_INSUFFICIENT_PERMISSIONS = "AUTH_INSUFFICIENT_PERMISSIONS",
  AUTH_ADMIN_REQUIRED = "AUTH_ADMIN_REQUIRED",
  
  // ========================================
  // VALIDATION ERRORS (2xxx)
  // ========================================
  VALIDATION_FAILED = "VALIDATION_FAILED",
  VALIDATION_MISSING_FIELD = "VALIDATION_MISSING_FIELD",
  VALIDATION_INVALID_FORMAT = "VALIDATION_INVALID_FORMAT",
  VALIDATION_INVALID_TYPE = "VALIDATION_INVALID_TYPE",
  VALIDATION_OUT_OF_RANGE = "VALIDATION_OUT_OF_RANGE",
  VALIDATION_DUPLICATE = "VALIDATION_DUPLICATE",
  
  // ========================================
  // RESOURCE NOT FOUND (3xxx)
  // ========================================
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND",
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND",
  WISHLIST_ITEM_NOT_FOUND = "WISHLIST_ITEM_NOT_FOUND",
  CART_NOT_FOUND = "CART_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  
  // ========================================
  // BUSINESS LOGIC ERRORS (4xxx)
  // ========================================
  PRODUCT_OUT_OF_STOCK = "PRODUCT_OUT_OF_STOCK",
  PRODUCT_INSUFFICIENT_STOCK = "PRODUCT_INSUFFICIENT_STOCK",
  ORDER_ALREADY_EXISTS = "ORDER_ALREADY_EXISTS",
  ORDER_CANNOT_BE_CANCELLED = "ORDER_CANNOT_BE_CANCELLED",
  ORDER_ALREADY_CANCELLED = "ORDER_ALREADY_CANCELLED",
  ORDER_ALREADY_REFUNDED = "ORDER_ALREADY_REFUNDED",
  ORDER_NOT_PAID = "ORDER_NOT_PAID",
  INVALID_ORDER_ID = "INVALID_ORDER_ID",
  INVALID_REFUND_AMOUNT = "INVALID_REFUND_AMOUNT",
  ORDER_ACCESS_DENIED = "ORDER_ACCESS_DENIED",
  ORDER_CANNOT_BE_DELETED = "ORDER_CANNOT_BE_DELETED",
  WISHLIST_ALREADY_EXISTS = "WISHLIST_ALREADY_EXISTS",
  CART_ITEM_LIMIT_EXCEEDED = "CART_ITEM_LIMIT_EXCEEDED",
  CART_QUANTITY_LIMIT_EXCEEDED = "CART_QUANTITY_LIMIT_EXCEEDED",
  PRICE_MISMATCH = "PRICE_MISMATCH",
  
  // ========================================
  // RATE LIMITING (5xxx)
  // ========================================
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  
  // ========================================
  // SERVER ERRORS (6xxx)
  // ========================================
  SERVER_ERROR = "SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED",
  
  // ========================================
  // REQUEST ERRORS (7xxx)
  // ========================================
  BAD_REQUEST = "BAD_REQUEST",
  MALFORMED_JSON = "MALFORMED_JSON",
  MISSING_BODY = "MISSING_BODY",
  INVALID_QUERY_PARAMS = "INVALID_QUERY_PARAMS",
}

/**
 * HTTP Status Code mapping for error codes
 */
export const ErrorStatusCode: Record<ErrorCode, number> = {
  // Authentication (401, 403)
  [ErrorCode.AUTH_REQUIRED]: 401,
  [ErrorCode.AUTH_INVALID_TOKEN]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.AUTH_ADMIN_REQUIRED]: 403,
  
  // Validation (400, 409)
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.VALIDATION_MISSING_FIELD]: 400,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
  [ErrorCode.VALIDATION_INVALID_TYPE]: 400,
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: 400,
  [ErrorCode.VALIDATION_DUPLICATE]: 409,
  
  // Not Found (404)
  [ErrorCode.PRODUCT_NOT_FOUND]: 404,
  [ErrorCode.CATEGORY_NOT_FOUND]: 404,
  [ErrorCode.ORDER_NOT_FOUND]: 404,
  [ErrorCode.WISHLIST_ITEM_NOT_FOUND]: 404,
  [ErrorCode.CART_NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
  
  // Business Logic (400, 409, 422)
  [ErrorCode.PRODUCT_OUT_OF_STOCK]: 400,
  [ErrorCode.PRODUCT_INSUFFICIENT_STOCK]: 400,
  [ErrorCode.ORDER_ALREADY_EXISTS]: 409,
  [ErrorCode.ORDER_CANNOT_BE_CANCELLED]: 422,
  [ErrorCode.ORDER_ALREADY_CANCELLED]: 409,
  [ErrorCode.ORDER_ALREADY_REFUNDED]: 409,
  [ErrorCode.ORDER_NOT_PAID]: 422,
  [ErrorCode.ORDER_ACCESS_DENIED]: 403,
  [ErrorCode.ORDER_CANNOT_BE_DELETED]: 422,
  [ErrorCode.INVALID_ORDER_ID]: 400,
  [ErrorCode.INVALID_REFUND_AMOUNT]: 400,
  [ErrorCode.WISHLIST_ALREADY_EXISTS]: 409,
  [ErrorCode.CART_ITEM_LIMIT_EXCEEDED]: 400,
  [ErrorCode.CART_QUANTITY_LIMIT_EXCEEDED]: 400,
  [ErrorCode.PRICE_MISMATCH]: 400,
  
  // Rate Limiting (429)
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.TOO_MANY_REQUESTS]: 429,
  
  // Server Errors (500)
  [ErrorCode.SERVER_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.EMAIL_SEND_FAILED]: 500,
  
  // Request Errors (400)
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.MALFORMED_JSON]: 400,
  [ErrorCode.MISSING_BODY]: 400,
  [ErrorCode.INVALID_QUERY_PARAMS]: 400,
};

/**
 * User-friendly error messages (production-safe)
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.AUTH_REQUIRED]: "Authentication is required to access this resource",
  [ErrorCode.AUTH_INVALID_TOKEN]: "Invalid authentication token",
  [ErrorCode.AUTH_TOKEN_EXPIRED]: "Your session has expired. Please sign in again",
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: "You don't have permission to perform this action",
  [ErrorCode.AUTH_ADMIN_REQUIRED]: "Administrator access is required",
  
  // Validation
  [ErrorCode.VALIDATION_FAILED]: "The request contains invalid data",
  [ErrorCode.VALIDATION_MISSING_FIELD]: "Required field is missing",
  [ErrorCode.VALIDATION_INVALID_FORMAT]: "Invalid format for field",
  [ErrorCode.VALIDATION_INVALID_TYPE]: "Invalid data type",
  [ErrorCode.VALIDATION_OUT_OF_RANGE]: "Value is out of acceptable range",
  [ErrorCode.VALIDATION_DUPLICATE]: "This item already exists",
  
  // Not Found
  [ErrorCode.PRODUCT_NOT_FOUND]: "Product not found",
  [ErrorCode.CATEGORY_NOT_FOUND]: "Category not found",
  [ErrorCode.ORDER_NOT_FOUND]: "Order not found",
  [ErrorCode.WISHLIST_ITEM_NOT_FOUND]: "Wishlist item not found",
  [ErrorCode.CART_NOT_FOUND]: "Shopping cart not found",
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  
  // Business Logic
  [ErrorCode.PRODUCT_OUT_OF_STOCK]: "This product is currently out of stock",
  [ErrorCode.PRODUCT_INSUFFICIENT_STOCK]: "Insufficient stock available",
  [ErrorCode.ORDER_ALREADY_EXISTS]: "An order with this number already exists",
  [ErrorCode.ORDER_CANNOT_BE_CANCELLED]: "This order cannot be cancelled",
  [ErrorCode.ORDER_ALREADY_CANCELLED]: "This order has already been cancelled",
  [ErrorCode.ORDER_ALREADY_REFUNDED]: "This order has already been refunded",
  [ErrorCode.ORDER_NOT_PAID]: "This order has not been paid yet",
  [ErrorCode.ORDER_ACCESS_DENIED]: "You do not have permission to access this order",
  [ErrorCode.ORDER_CANNOT_BE_DELETED]: "This order cannot be deleted",
  [ErrorCode.INVALID_ORDER_ID]: "Invalid order ID",
  [ErrorCode.INVALID_REFUND_AMOUNT]: "Invalid refund amount",
  [ErrorCode.WISHLIST_ALREADY_EXISTS]: "Item is already in your wishlist",
  [ErrorCode.CART_ITEM_LIMIT_EXCEEDED]: "Cart item limit exceeded",
  [ErrorCode.CART_QUANTITY_LIMIT_EXCEEDED]: "Maximum quantity per item exceeded",
  [ErrorCode.PRICE_MISMATCH]: "Price has changed since you added this to cart",
  
  // Rate Limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded. Please try again later",
  [ErrorCode.TOO_MANY_REQUESTS]: "Too many requests. Please slow down",
  
  // Server Errors
  [ErrorCode.SERVER_ERROR]: "An unexpected error occurred. Please try again",
  [ErrorCode.DATABASE_ERROR]: "Database operation failed",
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: "External service is temporarily unavailable",
  [ErrorCode.EMAIL_SEND_FAILED]: "Failed to send email",
  
  // Request Errors
  [ErrorCode.BAD_REQUEST]: "Invalid request",
  [ErrorCode.MALFORMED_JSON]: "Request body contains malformed JSON",
  [ErrorCode.MISSING_BODY]: "Request body is required",
  [ErrorCode.INVALID_QUERY_PARAMS]: "Invalid query parameters",
};
