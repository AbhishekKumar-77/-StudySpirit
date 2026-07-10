import soloApi from './soloApi';

/**
 * Dedicated service wrapper for AI Interview API calls.
 */
export const interviewApi = {
    start: async (payload) => {
        return soloApi.startInterview(payload);
    },
    end: async (payload) => {
        return soloApi.endInterview(payload);
    },
    getHistory: async () => {
        return soloApi.getInterviewHistory();
    },
    getSessionDetails: async (sessionId) => {
        return soloApi.getInterviewSession(sessionId);
    },
    checkATS: async (formData) => {
        return soloApi.checkATS(formData);
    }
};

export default interviewApi;
