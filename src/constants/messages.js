const successJson = (body, msg) => {
    return {
        body: body,
        message: msg,
        hasError: false
    }
}

const Messages = {
    RequiredFieldsAreEmpty: "Some required fields are empty",
    UserNotFound: 'User not found',
    UserHasLoggedOut: 'This user has logged out',
    UserCreatedSuccessfully: 'User created successfully',
    UserFetchedSuccessfully: 'User fetched successfully',
    UserIsNotVerified: 'User is not verified in the system',
    InvalidCredentials: 'Invalid credentials',
    InvalidEmail: 'Please provide a vaild email',
    UserLogoutSuccessfully: 'User logged out successfully',
    LoginSuccessful: 'Login successful',
    TokenDecodeFailure: 'Unable to find x-token in the headers',
    InvalidTokenSent: 'Unable to decode token.',
    TokenExpired: 'Your access token has been expired',
    OTPSentSuccessfully: 'Otp has been sent successfully',
    UserHasSuc: 'Otp has been sent successfully',
    OTPNotSentForVerification: 'Please hit send-otp api first',
    OTPExpired: 'Your otp has been expired',
    InvalidOtp: 'The otp is invalid',
    UserIsAlreadyVerified: 'This user is already verified',
    OTPVerifiedSuccessfully: 'Otp verified successfully',
    OTPIsRequired: 'Otp is required for verification',
    EmailIsRequired: 'Email is required',
    InvalidEmailAddress: 'Please enter a valid email address',
    EmailSentSuccessfully: 'Email sent successfully',
    UsernameIsRequired: 'Username is required',
    UserUpdatedSuccessfully: 'User updated successfully',
    TaskIsAlreadyCompleted: 'Task is already marked as completed.',
    TaskStatusUpdated: 'Tasks fetched successfully',
    TaskStartedSuccessfully: 'Tasks started successfully',
    TaskIsAlreadyStarted: 'Tasks is already started',
    TaskHasNotBeenStartedYet: 'Tasks is not started yet',
    TaskIsAlreadyCompleted: 'Tasks is already completed',
    TaskCompletedSuccessfully: 'Tasks completed successfully',
    NoTasksToShow: 'No tasks to show',
    TaskNotFound: 'Task not found',
    OnlyPremiumUserCanViewThisTask: 'This task is available for premium users only',
    TaskCreatedSuccessfully: 'Task created successfully',
    TaskUpdatedSuccessfully: 'Task updated successfully',
    TaskDeletedSuccessfully: 'Task deleted successfully',
    TherapiesFetched: 'Therapies fetched successfully',
    TherapiesNotFound: 'Therapies not found',
    TherapyNotFound: 'Therapy not found',
    NoTherapiesToShow: 'No therapies to show',
    TherapyCreatedSuccessfully: 'Therapy created successfully',
    YouHaveNoAdminAccess: 'Admin access is required',
    NotATherapist: 'You are not a therapist',
    TherapyNameRequired: 'Therapy name is required',
    TherapyNameMaxlenError: 'Therapy name cannot exceed 50 characters',
    TherapyDescriptionMaxlenError: 'Therapy description cannot exceed 300 characters',
    TaskCategoryDescriptionMaxlenError: 'Task category description cannot exceed 300 characters',
    TherapyWithThisNameAlreadyExists: 'Therapy with this name already exists',
    TherapyUpdatedSuccessfully: 'Therapy updated successfully',
    TherapyDeletedSuccessfully: 'Therapy deleted successfully',
    // Task Categories
    CategoryNotFound: "Task category not found",
    CategoryCreatedSuccessfully: "Task category created successfully",
    CategoryCreatedSuccessfully: "Task category created successfully",
    CategoryUpdatedSuccessfully: "Task category updated successfully",
    CategoryDeletedSuccessfully: "Task category deleted successfully",
    CategoriesFetchSuccessfully: "Task categories fetched successfully",

    // Therapy Plan
    ExpertiseMaxLength: "Therapy Expertise cannot be more than 500 characters",
    TherapyTitleMaxLength: "Therapy Title cannot be more than 200 characters",
    ExpertiseRequired: "Therapy 'experise' is required",
    TherapyTitleRequired: "Therapy 'title' is required",
    TherapyPlanPriceIsRequired: "Therapy Plan 'price' is required",
    UserRequiredForRating: "User is required for rating",
    RatingIsRequired: "Rating is required",
    RatingLowerBound: "Rating must be atleast 1",
    RatingUpperBound: "Rating can be maximum 5",
    TherapyPlanDescriptionMaxLength: "Therapy Plan description cannot be more than 1000 words long",
    TherapyPlansFetchedSuccessfully: "Therapy plans fetched successfully",
    TherapyPlansCreatedSuccessfully: "Therapy plans created successfully",
    TherapyPlansUpdatedSuccessfully: "Therapy plans updated successfully",
    TherapyPlansDeletedSuccessfully: "Therapy plans deleted successfully",
    TherapyPlansNotFound: "Therapy plans not found",
    TherapyPlansEmpty: "No therapy plans exists",


    // Therapist
    TherapistNotFound: "Therapist not found",
    InvalidMonth: "You have entered invalid month",

    // Availabilites
    AvailabilitesNotFound: "Availabilities not found",
    AvailabilitesAlreadyExists: "Availabilities already exists",
    AvailabilitesFetchedSuccessfully: "Availabilities fetched successfully",
    AvailableSlotsFetchedSuccessfully: "Available slots fetched successfully",
    AvailabilityCreatedSuccessfully: "Availability created successfully",
    AvailabilityUpdatedSuccessfully: "Availability updated successfully",
    AvailabilityDeletedSuccessfully: "Availability deleted successfully",
    AvailabilityDatesCannotBeEmpty: 'availability_dates must be a non-empty array of dates.',
    SlotNotFound: "Time slot not found",
    SlotAlreadyBooked: "Time slot is already booked",

    // Appointments
    AppointmentCreatedSuccessfully: "Appointments created successfully",
    AppointmentFetchedSuccessfully: "Appointments fetched successfully",
    AppointmentNotFound: "Appointments not found",
    AppointmentApprovedSuccessfully: "Appointments approved successfully",
    AppointmentRejectedSuccessfully: "Appointments rejected successfully",
    AppointmentCancelledSuccessfully: "Appointments cancelled successfully",
    AppointmentAlreadyApproved: "Appointments already approved",
    AppointmentAlreadyRejected: "Appointments already cancelled",
}



const errorJson = (msg) => {
    return {
        body: {},
        message: msg,
        hasError: true
    }
}




module.exports = {
    successJson,
    errorJson,
    Messages,
}