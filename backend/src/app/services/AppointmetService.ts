class AppointmentService {
    public getNextStatus(currentStatus: string, tag: number): string | null {
        let nextStatus: string | null = null;

        const statuses = [
            'requested',
            'verified',
            'queued',
            'cancelled',
            'ongoing',
            'completed',
        ];

        if (
            !statuses.includes(currentStatus) ||
            currentStatus == 'cancelled' ||
            currentStatus === 'completed'
        ) {
            return null;
        }

        // if currentStatus is in [requested, verified, queued, cancelled, ongoing]
        if (currentStatus === 'requested') {
            nextStatus = 'verified';
        } else if (currentStatus === 'ongoing') {
            nextStatus = 'completed';
        } else if (currentStatus === 'verified') {
            if (tag === 1) {
                nextStatus = 'queued';
            } else if (tag === 2) {
                nextStatus = 'cancelled';
            } else {
                nextStatus = null;
            }
        }

        return nextStatus;
    }

    public createVerificationCode(): string {
        // total 8 characters
        // 0 - 9
        // A - Z

        let code = '';

        for (let i = 0; i < 8; i++) {
            const random = Math.floor(Math.random() * 36);

            if (random < 10) {
                code += random;
            } else {
                code += String.fromCharCode(random + 55);
            }
        }

        return code;
    }
}

export default AppointmentService;
