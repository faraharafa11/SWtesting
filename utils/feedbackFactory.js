const feedbackResponseDTO = (feedback) => {
    return {
        id: feedback._id,
        userId: feedback.userId,
        reservationId: feedback.reservationId || null,
        rating: feedback.rating,
        comment: feedback.comment || null,
        createdAt: feedback.createdAt
    };
};

module.exports = {
    feedbackResponseDTO
};

