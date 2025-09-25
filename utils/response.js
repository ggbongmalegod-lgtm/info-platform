class ApiResponse {
  static success(data = null, message = 'Success', code = 200) {
    return {
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message = 'Error', code = 500, data = null) {
    return {
      success: false,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, pagination) {
    return {
      success: true,
      code: 200,
      message: 'Success',
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ApiResponse;