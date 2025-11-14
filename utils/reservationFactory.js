const reservationResponseDTO = (reservation) => {
    return {
        id: reservation._id,
        userId: reservation.userId,
        tableNo: reservation.tableNo,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        status: reservation.status
    };
};

module.exports = {
    reservationResponseDTO
};
