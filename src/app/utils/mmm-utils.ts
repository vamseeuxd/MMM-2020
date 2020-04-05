export const getRecurringTransactionTitle = (repeat, type, interval) => {
  switch (repeat) {
    case 'never':
      return `This ${type} is only one time ${type}`;
      break;
    case 'daily':
      return `This ${type} is for every ${interval}  ${interval === 1 ? 'day' : 'days'}.`;
      break;
    case 'weekly':
      return `This ${type} is for every ${interval}  ${interval === 1 ? 'week' : 'weeks'}.`;
      break;
    case 'monthly':
      return `This ${type} is for every ${interval}  ${interval === 1 ? 'month' : 'months'}.`;
      break;
    case 'yearly':
      return `This ${type} is for every ${interval}  ${interval === 1 ? 'year' : 'years'}.`;
      break;
  }
};
