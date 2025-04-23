export const ATTRIBUTE_TYPES = {
    human_name: {
        regex: /^(?!.*\s$)(?!^\s)(?!.*\s{2})[a-zA-Z\s']+$/,
        minLength: 2,
        maxLength: 100
    },
    singleWord: {
        regex: /^(?!.*\s)[a-zA-Z'-_]+$/,
        minLength: 1,
        maxLength: 100
    },
    mobileNumberWorldWide: {
        regex: /^\d{5,15}$/
    },
    mobileNumberCountryCode: {
        regex: /^\+?\d{1,3}$/
    }
}