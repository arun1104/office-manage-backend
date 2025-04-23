import { QUARTERS, HALF_YEARS, FINANCIAL_MONTHS } from '@constants';
import { PERIODICITY } from '@enums';
export class PeriodUtilities {
    constructor() {
        this.generateValuesForMonthlyPeriodicity = this.generateValuesForMonthlyPeriodicity.bind(this);
        this.generateValuesForYearlyPeriodicity = this.generateValuesForYearlyPeriodicity.bind(this);
        this.generateValuesForHalf_YearlyPeriodicity = this.generateValuesForHalf_YearlyPeriodicity.bind(this);
        this.generateValuesForQuarterlyPeriodicity = this.generateValuesForQuarterlyPeriodicity.bind(this);
        this.get_TodayS_DateStringIn_YYYYMMDD_format = this.get_TodayS_DateStringIn_YYYYMMDD_format.bind(this);
        this.generateFinancialYearList = this.generateFinancialYearList.bind(this);
        this.getPeriodList = this.getPeriodList.bind(this);
        this.getCurrentPreviousNextFYs = this.getCurrentPreviousNextFYs.bind(this);
        this.generatePeriodListForFY = this.generatePeriodListForFY.bind(this);
    }

    generatePeriodListForFY({ periodicity, fy }) {
        let periods = [];
        let startYear;
        const regex = /\d{4}-\d{2}/;
        if (regex.test(fy)) {
             [startYear] = fy.split('-').map(Number);
        } else {
            [startYear] = fy.split('-').map(Number);
       }
        
        switch (periodicity) {
            case PERIODICITY.YEARLY:
                periods.push(fy);
                break;
            case PERIODICITY.MONTHLY:
                periods = this.generateValuesForMonthlyPeriodicityForNonRepeating({startMonth:3,year: startYear})
                break;
            case PERIODICITY.HALF_YEARLY:
               periods = HALF_YEARS
                break;
            case PERIODICITY.QUARTERLY:
                periods = QUARTERS;
                break;
        }
        return periods;
    }

    generateValuesForMonthlyPeriodicityForNonRepeating({
        year,
        startMonth = 3
    }) {
        const result = [];
        const monthStartDate = new Date(Date.UTC(year, startMonth, 1, 12, 0, 0));
        for (let month = 0; month < 12; month++) {
            const startMonthString = this.getMonthStringFromDate(monthStartDate);
            const periodYear = monthStartDate.getFullYear();
            const periodString = `${startMonthString} ${periodYear}`;
            result.push(periodString);
            monthStartDate.setMonth(monthStartDate.getMonth() + 1);
        }
        return result;
    }

    getCurrentPreviousNextFYs() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // January is 0, so add 1

        const isBeforeApril = currentMonth <= 3;

        const currentFYStartYear = isBeforeApril ? currentYear - 1 : currentYear;
        const nextFYStartYear = currentFYStartYear + 1;
        const previousFYStartYear = currentFYStartYear - 1;

        const currentFYEndYear = (nextFYStartYear % 100).toString().padStart(2, '0');
        const nextFYEndYear = (nextFYStartYear + 1).toString().slice(-2);
        const previousFYEndYear = (previousFYStartYear + 1).toString().slice(-2);

        const currentFY = `${currentFYStartYear}-${currentFYEndYear}`;
        const previousFY = `${previousFYStartYear}-${previousFYEndYear}`;
        const nextFY = `${nextFYStartYear}-${nextFYEndYear}`;

        return {
            current: currentFY,
            previous: previousFY,
            next: nextFY,
        };
    }

    getMonthStringFromDate(dateObj: Date) {
        const threeLetterMonth = dateObj.toLocaleString('default', { month: 'short' });
        if (threeLetterMonth != 'Sept') {
            return threeLetterMonth;
        } else return 'Sep';
    }

    getDateInNumberFormat(dateStr: string) {
        // eslint-disable-next-line prefer-const
        let [day, month, year] = dateStr.split('/');
        if (day.length == 1) {
            day = `0${day}`
        }
        if (month.length == 1) {
            month = `0${month}`
        }
        return `${year}${month}${day}`;
    }

    get_TodayS_DateStringIn_YYYYMMDD_format(timeZone) {
        const currentDate = new Date().toLocaleString("en-US", { timeZone });
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}${month}${day}`;
    }

    getDateString(timezone, date) {
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
            timeZone: timezone,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
        return formattedDate;
    }

    getFY(year) {
        const nextYearString = (year + 1).toString();
        return `${year}-${nextYearString.slice(2)}`;
    }

    getPeriodRange(startMonth, endMonth, year) {
        return `${startMonth}-${endMonth} ${year}`;
    }

    generateFinancialYearList(effectiveYear, untilYear) {
        const startYear = parseInt(effectiveYear);
        const endYear = parseInt(untilYear);
        const financialYearList = [];
        for (let year = startYear; year < endYear; year++) {
            const fyValue = this.getFY(year);
            financialYearList.push(fyValue);
        }
        return financialYearList;
    }

    getPeriodList(periodicity) {
        switch (periodicity) {
            case PERIODICITY.MONTHLY:
                return FINANCIAL_MONTHS;
            case PERIODICITY.HALF_YEARLY:
                return HALF_YEARS;
            case PERIODICITY.QUARTERLY:
                return QUARTERS;
            case PERIODICITY.NOT_APPLICABLE:
                return ["none"]
        }
    }

    getInitialPeriodsForMonthly({ effectiveYear, financialYear, months, startMonth = 3 }) {
        const result = [];
        const monthStartDate = new Date(Date.UTC(effectiveYear, startMonth, 1, 12, 0, 0));
        for (let index = 0; index < months.length; index++) {
            const periodMonth = FINANCIAL_MONTHS[index];
            const periodYear = monthStartDate.getFullYear();
            const monthData = months.find(e => e.month === periodMonth);
            const dueDateString = monthData.dueDate;
            const taskCreationDateString = monthData.taskCreationDate;
            const internalDueDateString = monthData.internalDueDate;
            const monthString = this.getMonthStringFromDate(monthStartDate);
            const periodString = `${monthString} ${periodYear}`;
            const period = {
                dueDateString,
                dueDateInNumber: this.getDateInNumberFormat(dueDateString),
                taskCreationDateString,
                taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateString),
                internalDueDateString,
                internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateString),
                periodicity: PERIODICITY.MONTHLY,
                periodSortKey: `${String.fromCharCode(65 + index)}#${periodString}`,
                periodRange: periodString,
                periodString,
                financialYear,

            };
            result.push(period);
            monthStartDate.setMonth(monthStartDate.getMonth() + 1);
        }
        return result;
    }

    getInitialPeriodsForQuarterly({ effectiveYear, financialYear, quarters, startMonth = 3 }) {
        const result = [];
        const quarterStartDate = new Date(Date.UTC(effectiveYear, startMonth, 1, 12, 0, 0));
        for (let index = 0; index < quarters.length; index++) {
            const periodQuarter = QUARTERS[index];
            const quarterStartMonthString = this.getMonthStringFromDate(quarterStartDate);
            const quarterEndDate = new Date(quarterStartDate.setMonth(quarterStartDate.getMonth() + 2));
            const quarterEndYear = quarterEndDate.getFullYear();
            const quarterEndMonthString = this.getMonthStringFromDate(quarterEndDate);
            const quarterPeriod = this.getPeriodRange(quarterStartMonthString, quarterEndMonthString, quarterEndYear);
            const quarterData = quarters.find(e => e.quarter === periodQuarter);
            const dueDateString = quarterData.dueDate;
            const taskCreationDateString = quarterData.taskCreationDate;
            const internalDueDateString = quarterData.internalDueDate;
            const periodString = periodQuarter;
            const period = {
                dueDateString,
                dueDateInNumber: this.getDateInNumberFormat(dueDateString),
                taskCreationDateString,
                taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateString),
                internalDueDateString,
                internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateString),
                periodicity: PERIODICITY.QUARTERLY,
                periodSortKey: periodString,
                periodRange: quarterPeriod,
                periodString,
                financialYear,

            };
            result.push(period);
            quarterStartDate.setMonth(quarterStartDate.getMonth() + 1);
        }
        return result;
    }

    getInitialPeriodsForHalfYearly({ effectiveYear, financialYear, halfYears, startMonth = 3 }) {
        const result = [];
        const halfYearStartDate = new Date(Date.UTC(effectiveYear, startMonth, 1, 12, 0, 0));
        for (let index = 0; index < halfYears.length; index++) {
            const periodHalfYear = HALF_YEARS[index];
            const halfYearStartMonthString = this.getMonthStringFromDate(halfYearStartDate);
            const halfYearEndDate = new Date(halfYearStartDate.setMonth(halfYearStartDate.getMonth() + 5));
            const halfYearEndYear = halfYearEndDate.getFullYear();
            const halfYearEndMonthString = this.getMonthStringFromDate(halfYearEndDate);
            const halfYearPeriod = this.getPeriodRange(halfYearStartMonthString, halfYearEndMonthString, halfYearEndYear);
            const halfYearData = halfYears.find(e => e.halfYear === periodHalfYear);
            const dueDateString = halfYearData.dueDate;
            const taskCreationDateString = halfYearData.taskCreationDate;
            const internalDueDateString = halfYearData.internalDueDate;
            const periodString = periodHalfYear;
            const period = {
                dueDateString,
                dueDateInNumber: this.getDateInNumberFormat(dueDateString),
                taskCreationDateString,
                taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateString),
                internalDueDateString,
                internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateString),
                periodicity: PERIODICITY.HALF_YEARLY,
                periodSortKey: periodString,
                periodRange: halfYearPeriod,
                periodString,
                financialYear,

            };
            result.push(period);
            halfYearStartDate.setMonth(halfYearStartDate.getMonth() + 1);
        }
        return result;
    }

    incrementDatesAsPerNewYear(date, newEffectiveYear, difference) {
        const splittedBySlash = date.split('/');
        splittedBySlash[2] = (newEffectiveYear + difference).toString();
        return splittedBySlash.join('/');
    }

    getPeriodRangeForYear({ year, startMonth, financialYear }) {
        const rangeStart = new Date(Date.UTC(year, startMonth, 1, 12, 0, 0));
        const rangeStartString = this.getMonthStringFromDate(rangeStart);
        const rangeEnd = new Date(rangeStart.setMonth(rangeStart.getMonth() + 11));
        const rangeEndString = this.getMonthStringFromDate(rangeEnd);
        const periodRange = this.getPeriodRange(rangeStartString, rangeEndString, financialYear);
        return periodRange;
    }

    getMonthDifference(months, effectiveYear) {
        const result: Array<{ internalDueDate: string, dueDate: string, internalDueDateDifference: number, taskCreationDate: string, month: string, dueDateDifference: number, taskCreationDateDifference: number }> = [];
        for (let i = 0; i < months.length; i++) {
            const monthData = months[i];
            const temp = {
                month: monthData.month,
                dueDate: monthData.dueDate,
                taskCreationDate: monthData.taskCreationDate,
                internalDueDate: monthData.internalDueDate,
                dueDateDifference: parseInt(monthData.dueDate.split('/')[2]) - parseInt(effectiveYear),
                taskCreationDateDifference: parseInt(monthData.taskCreationDate.split('/')[2]) - parseInt(effectiveYear),
                internalDueDateDifference: parseInt(monthData.internalDueDate.split('/')[2]) - parseInt(effectiveYear),
            };
            result.push(temp);

        }
        return result;
    }

    getQuarterDifference(quarters, effectiveYear) {
        const result: Array<{ internalDueDate: string, dueDate: string, internalDueDateDifference: number, taskCreationDate: string, quarter: string, dueDateDifference: number, taskCreationDateDifference: number }> = [];
        for (let i = 0; i < quarters.length; i++) {
            const quarterData = quarters[i];
            const temp = {
                quarter: quarterData.quarter,
                dueDate: quarterData.dueDate,
                taskCreationDate: quarterData.taskCreationDate,
                internalDueDate: quarterData.internalDueDate,
                dueDateDifference: parseInt(quarterData.dueDate.split('/')[2]) - parseInt(effectiveYear),
                taskCreationDateDifference: parseInt(quarterData.taskCreationDate.split('/')[2]) - parseInt(effectiveYear),
                internalDueDateDifference: parseInt(quarterData.internalDueDate.split('/')[2]) - parseInt(effectiveYear),

            };
            result.push(temp);

        }
        return result;
    }

    getHalfYearDifference(halfYears, effectiveYear) {
        const result: Array<{ internalDueDate: string, dueDate: string, taskCreationDate: string, halfYear: string, dueDateDifference: number, internalDueDateDifference: number, taskCreationDateDifference: number }> = [];
        for (let i = 0; i < halfYears.length; i++) {
            const halfYearData = halfYears[i];
            const temp = {
                halfYear: halfYearData.halfYear,
                dueDate: halfYearData.dueDate,
                internalDueDate: halfYearData.internalDueDate,
                taskCreationDate: halfYearData.taskCreationDate,
                dueDateDifference: parseInt(halfYearData.dueDate.split('/')[2]) - parseInt(effectiveYear),
                taskCreationDateDifference: parseInt(halfYearData.taskCreationDate.split('/')[2]) - parseInt(effectiveYear),
                internalDueDateDifference: parseInt(halfYearData.internalDueDate.split('/')[2]) - parseInt(effectiveYear),
            };
            result.push(temp);

        }
        return result;
    }

    generateValuesForYearlyPeriodicity({
        startMonth = 3,
        effectiveYear,
        untilYear,
        dueDateForFirstEffectiveYear,
        taskCreationDateForFirstEffectiveYear,
        internalDueDateForFirstEffectiveYear }) {

        effectiveYear = parseInt(effectiveYear);
        untilYear = parseInt(untilYear);
        const dueDateYearDifference = parseInt(dueDateForFirstEffectiveYear.split('/')[2]) - effectiveYear;
        const taskCreationYearDifference = parseInt(taskCreationDateForFirstEffectiveYear.split('/')[2]) - effectiveYear;
        const internalDueDateYearDifference = parseInt(internalDueDateForFirstEffectiveYear.split('/')[2]) - effectiveYear;
        const financialYear = this.getFY(effectiveYear);
        const result = [];
        const period = {
            periodicity: PERIODICITY.YEARLY,
            periodSortKey: financialYear,
            periodString: `FY ${financialYear}`,
            periodRange: this.getPeriodRangeForYear({ startMonth, year: effectiveYear, financialYear }),
            financialYear,
            dueDateString: dueDateForFirstEffectiveYear,
            internalDueDateString: internalDueDateForFirstEffectiveYear,
            internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateForFirstEffectiveYear),
            taskCreationDateString: taskCreationDateForFirstEffectiveYear,
            dueDateInNumber: this.getDateInNumberFormat(dueDateForFirstEffectiveYear),
            taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateForFirstEffectiveYear),

        };
        result.push(period);
        let indexToLastPeriod = 0;
        for (let newEffectiveYear = effectiveYear + 1; newEffectiveYear < untilYear; newEffectiveYear++) {
            const newDueDateString = this.incrementDatesAsPerNewYear(result[indexToLastPeriod].dueDateString, newEffectiveYear, dueDateYearDifference);
            const newTaskCreationDateString = this.incrementDatesAsPerNewYear(result[indexToLastPeriod].taskCreationDateString, newEffectiveYear, taskCreationYearDifference);
            const newInternalDueDateString = this.incrementDatesAsPerNewYear(result[indexToLastPeriod].internalDueDateString, newEffectiveYear, internalDueDateYearDifference);

            indexToLastPeriod++;
            const financialYear = this.getFY(newEffectiveYear);
            const nextPeriod = {
                periodicity: PERIODICITY.YEARLY,
                periodSortKey: financialYear,
                periodString: `FY ${financialYear}`,
                periodRange: this.getPeriodRangeForYear({ startMonth, year: newEffectiveYear, financialYear }),
                financialYear,
                dueDateString: newDueDateString,
                taskCreationDateString: newTaskCreationDateString,
                internalDueDateString: newInternalDueDateString,
                internalDueDateInNumber: this.getDateInNumberFormat(newInternalDueDateString),
                dueDateInNumber: this.getDateInNumberFormat(newDueDateString),
                taskCreationDateInNumber: this.getDateInNumberFormat(newTaskCreationDateString),
            }
            result.push(nextPeriod);
        }
        return result;
    }

    generateValuesForMonthlyPeriodicity({
        effectiveYear,
        untilYear,
        months,
        startMonth = 3
    }) {
        effectiveYear = parseInt(effectiveYear);
        untilYear = parseInt(untilYear);
        const result = [];
        const financialYear = this.getFY(effectiveYear);
        const monthDifference = this.getMonthDifference(months, effectiveYear);
        result.push(...this.getInitialPeriodsForMonthly({ effectiveYear, financialYear, months, startMonth }));
        for (let year = effectiveYear + 1; year < untilYear; year++) {
            const financialYear = this.getFY(year);
            const monthStartDate = new Date(Date.UTC(year, startMonth, 1, 12, 0, 0));
            for (let month = 0; month < 12; month++) {
                const startMonthString = this.getMonthStringFromDate(monthStartDate);
                const periodYear = monthStartDate.getFullYear();

                const monthConfig = monthDifference.find(e => e.month === startMonthString);
                const dueDateDiff = monthConfig.dueDateDifference;
                const internalDueDateDiff = monthConfig.internalDueDateDifference;
                const taskCreationDateDiff = monthConfig.taskCreationDateDifference;
                const periodString = `${startMonthString} ${periodYear}`;

                const dueDateString = this.incrementDatesAsPerNewYear(monthConfig.dueDate, year, dueDateDiff);
                const taskCreationDateString = this.incrementDatesAsPerNewYear(monthConfig.taskCreationDate, year, taskCreationDateDiff);
                const internalDueDateString = this.incrementDatesAsPerNewYear(monthConfig.internalDueDate, year, internalDueDateDiff);

                result.push({
                    financialYear,
                    periodString,
                    periodSortKey: `${String.fromCharCode(65 + month)}#${periodString}`,
                    periodRange: periodString,
                    dueDateString,
                    dueDateInNumber: this.getDateInNumberFormat(dueDateString),
                    taskCreationDateString,
                    taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateString),
                    internalDueDateString,
                    internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateString),
                    periodicity: PERIODICITY.MONTHLY
                });
                monthStartDate.setMonth(monthStartDate.getMonth() + 1);
            }
        }
        return result;
    }

    generateValuesForHalf_YearlyPeriodicity({
        effectiveYear,
        untilYear,
        startMonth = 3,
        halfYears }) {
        effectiveYear = parseInt(effectiveYear);
        untilYear = parseInt(untilYear);
        const result = [];
        const financialYear = this.getFY(effectiveYear);
        const halfYearDifference = this.getHalfYearDifference(halfYears, effectiveYear);
        result.push(...this.getInitialPeriodsForHalfYearly({ effectiveYear, financialYear, halfYears, startMonth }));
        for (let year = effectiveYear + 1; year < untilYear; year++) {
            const financialYear = this.getFY(year);
            const halfYearStartDate = new Date(Date.UTC(year, startMonth, 1, 12, 0, 0));
            for (let index = 0; index < HALF_YEARS.length; index++) {
                const halfYear = HALF_YEARS[index];
                const halfYearStartMonthString = this.getMonthStringFromDate(halfYearStartDate);
                const halfYearEndDate = new Date(halfYearStartDate.setMonth(halfYearStartDate.getMonth() + 5));
                const halfYearEndYear = halfYearEndDate.getFullYear();
                const halfYearEndMonthString = this.getMonthStringFromDate(halfYearEndDate);

                const halfYearPeriod = this.getPeriodRange(halfYearStartMonthString, halfYearEndMonthString, halfYearEndYear);

                const halfYearData = halfYearDifference.find(e => e.halfYear === halfYear);
                const dueDateDiff = halfYearData.dueDateDifference;
                const taskCreationDateDiff = halfYearData.taskCreationDateDifference;
                const internalDueDateDiff = halfYearData.internalDueDateDifference;
                const dueDateString = this.incrementDatesAsPerNewYear(halfYearData.dueDate, year, dueDateDiff);
                const taskCreationDateString = this.incrementDatesAsPerNewYear(halfYearData.taskCreationDate, year, taskCreationDateDiff);
                const internalDueDateString = this.incrementDatesAsPerNewYear(halfYearData.internalDueDate, year, internalDueDateDiff);

                result.push({
                    financialYear,
                    periodString: halfYear,
                    periodSortKey: halfYear,
                    periodRange: halfYearPeriod,
                    dueDateString,
                    dueDateInNumber: this.getDateInNumberFormat(dueDateString),
                    taskCreationDateString,
                    taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateString),
                    internalDueDateString,
                    internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateString),
                    periodicity: PERIODICITY.HALF_YEARLY
                });
                halfYearStartDate.setMonth(halfYearStartDate.getMonth() + 1);
            }
        }
        return result;
    }

    generateValuesForQuarterlyPeriodicity({
        effectiveYear,
        untilYear,
        startMonth = 3,
        quarters }) {
        effectiveYear = parseInt(effectiveYear);
        untilYear = parseInt(untilYear);
        const result = [];
        const financialYear = this.getFY(effectiveYear);
        const quarterDifference = this.getQuarterDifference(quarters, effectiveYear);
        result.push(...this.getInitialPeriodsForQuarterly({ effectiveYear, financialYear, quarters, startMonth }));
        for (let year = effectiveYear + 1; year < untilYear; year++) {
            const financialYear = this.getFY(year);
            const quarterStartDate = new Date(Date.UTC(year, startMonth, 1, 12, 0, 0));
            for (let index = 0; index < QUARTERS.length; index++) {
                const quarter = QUARTERS[index];
                const quarterStartMonthString = this.getMonthStringFromDate(quarterStartDate);
                const quarterEndDate = new Date(quarterStartDate.setMonth(quarterStartDate.getMonth() + 2));
                const quarterEndYear = quarterEndDate.getFullYear();
                const quarterEndMonthString = this.getMonthStringFromDate(quarterEndDate);
                const quarterPeriod = this.getPeriodRange(quarterStartMonthString, quarterEndMonthString, quarterEndYear);

                const quarterConfig = quarterDifference.find(e => e.quarter === quarter);
                const dueDateDiff = quarterConfig.dueDateDifference;
                const taskCreationDateDiff = quarterConfig.taskCreationDateDifference;
                const internalDueDateDiff = quarterConfig.internalDueDateDifference;

                const dueDateString = this.incrementDatesAsPerNewYear(quarterConfig.dueDate, year, dueDateDiff);
                const taskCreationDateString = this.incrementDatesAsPerNewYear(quarterConfig.taskCreationDate, year, taskCreationDateDiff);
                const internalDueDateString = this.incrementDatesAsPerNewYear(quarterConfig.internalDueDate, year, internalDueDateDiff);

                result.push({
                    financialYear,
                    periodString: quarter,
                    periodSortKey: quarter,
                    periodRange: quarterPeriod,
                    dueDateString,
                    dueDateInNumber: this.getDateInNumberFormat(dueDateString),
                    taskCreationDateString,
                    taskCreationDateInNumber: this.getDateInNumberFormat(taskCreationDateString),
                    internalDueDateString,
                    internalDueDateInNumber: this.getDateInNumberFormat(internalDueDateString),
                    periodicity: PERIODICITY.QUARTERLY
                });
                quarterStartDate.setMonth(quarterStartDate.getMonth() + 1);
            }
        }
        return result;
    }
}
