function buildUniqueSources(relevantChunks) {
  return [
    ...new Map(
      relevantChunks.map((chunk) => [
        chunk.fileName,
        {
          fileName: chunk.fileName,
        },
      ])
    ).values(),
  ];
}

module.exports = {
    buildUniqueSources, 
};