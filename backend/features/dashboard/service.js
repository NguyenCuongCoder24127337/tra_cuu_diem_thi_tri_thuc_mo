const model = require("./model");

async function getDashboardData(studentId) {
  const scores = await model.findStudentScores(studentId);
  const studentsWithScores = await model.findAllStudentsWithScores();

  const top3BySubject = {};

  for (const subject of model.subjects) {
    top3BySubject[subject] = [...studentsWithScores]
      .sort((a, b) => b.scores[subject] - a.scores[subject])
      .slice(0, 3)
      .map((item) => ({
        fullName: item.fullName,
        className: item.className,
        score: item.scores[subject],
      }));
  }

  return {
    subjects: model.subjects,
    subjectLabels: model.subjectLabels,
    scores,
    top3BySubject,
  };
}

module.exports = {
  getDashboardData,
};
