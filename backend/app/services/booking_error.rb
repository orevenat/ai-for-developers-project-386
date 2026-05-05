class BookingError < StandardError
  attr_reader :code, :status

  def initialize(code:, message:, status:)
    super(message)
    @code = code
    @status = status
  end
end
