// Simple if/else rules that turn the meal totals into friendly tips.
// type is used by the frontend to pick a colour: "good" = green, "tip" = amber, "info" = blue.

function getNutritionTips(totals, categories) {
  const tips = [];

  if (totals.calories > 1800) {
    tips.push({
      type: 'info',
      text: `About ${totals.calories} kcal - close to a full day's need for most adults. This one is great for sharing!`,
    });
  } else if (totals.calories > 900) {
    tips.push({
      type: 'info',
      text: 'A filling meal. If you are eating alone, you could keep half for later.',
    });
  } else {
    tips.push({ type: 'good', text: 'A light-to-moderate meal - a good size for lunch or dinner.' });
  }

  if (totals.protein >= 30) {
    tips.push({
      type: 'good',
      text: `Good protein (${totals.protein} g). Protein keeps you full for longer.`,
    });
  }

  if (totals.fiber < 8) {
    tips.push({
      type: 'tip',
      text: 'Low on fibre. Add Dal Tadka or Mirchi ka Salan to balance the meal.',
    });
  }

  if (totals.fat > 60) {
    tips.push({
      type: 'tip',
      text: 'Fat is on the higher side. Rumali Roti is a lighter choice than Butter Naan.',
    });
  }

  if (categories.includes('biryani') && !categories.includes('beverages')) {
    tips.push({
      type: 'tip',
      text: 'Biryani is spicy - a Mango Lassi or plain water helps cool things down.',
    });
  }

  return tips;
}

module.exports = { getNutritionTips };
