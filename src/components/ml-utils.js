// Internal helper function
function oneHotEncode(data, column) {
    const uniqueValues = [...new Set(data.map(d => d[column]).filter(Boolean))];
    return Object.fromEntries(
        uniqueValues.map(value => [
            `${column}_${value}`,
            data.map(d => d[column] === value ? 1 : 0)
        ])
    );
}

// Exported main function
export function prepareImagingData(data) {
    const genderBinary = data.map(d => d.Gender?.toLowerCase() === 'male' ? 1 : 0);
    const pceBinary = data.map(d => d.PrimaryCareEngagement === true ? 1 : 0);
    const smokingBinary = data.map(d => d.SmokingStatus === 'Current' ? 1 : 0);
    
    const regionEncoded = oneHotEncode(data.map(d => ({Region: d.Region})), 'Region');
    const diagnosisEncoded = oneHotEncode(data.map(d => ({Diagnosis: d.Diagnosis})), 'Diagnosis');
    const incomeEncoded = oneHotEncode(data.map(d => ({IncomeBracket: d.IncomeBracket})), 'IncomeBracket');
    const planTypeEncoded = oneHotEncode(data.map(d => ({PlanType: d.PlanType})), 'PlanType');

    const X = data.map((_, i) => [
        data[i].Age,
        data[i].ImagingVisits,
        genderBinary[i],
        pceBinary[i],
        smokingBinary[i],
        ...Object.values(regionEncoded).map(col => col[i]),
        ...Object.values(diagnosisEncoded).map(col => col[i]),
        ...Object.values(incomeEncoded).map(col => col[i]),
        ...Object.values(planTypeEncoded).map(col => col[i])
    ]);

    const y = data.map(d => d.NonPreferredVisits > 0 ? 1 : 0);

    const featureNames = [
        'Age',
        'ImagingVisits',
        'Gender',
        'PrimaryCareEngagement',
        'SmokingStatus',
        ...Object.keys(regionEncoded),
        ...Object.keys(diagnosisEncoded),
        ...Object.keys(incomeEncoded),
        ...Object.keys(planTypeEncoded)
    ];

    return { X, y, featureNames };
}
export function binarize(data, column) {
    return data.map(row => {
        switch(column) {
            case 'Gender':
                return row[column].toLowerCase() === 'male' ? 1 : 0;
            case 'PrimaryCareEngagement':
                return row[column] === true || row[column] === 'Yes' ? 1 : 0;
            case 'SmokingStatus':
                return row[column] === 'Current' || row[column] === 'Yes' ? 1 : 0;
            case 'NonPreferredVisits':
                return row[column] > 0 ? 1 : 0;
            default:
                return row[column] ? 1 : 0;
        }
    });
}

// Stratified random subsampling
export function stratifiedSubsample(data, headers, sampleSize) {
    const groups = {};
    data.forEach((item) => {
        const key = headers.map((header) => item[header]).join('|');
        groups[key] = groups[key] || [];
        groups[key].push(item);
    });

    const totalSize = data.length;
    const groupSizes = {};
    for (const key in groups) {
        groupSizes[key] = Math.min(
            groups[key].length,
            Math.round((groups[key].length / totalSize) * sampleSize)
        );
    }

    return Object.entries(groups).flatMap(([key, group]) =>
        getRandomSubsample(group, groupSizes[key])
    );
}

// Helper function to randomly sample from a group
export function getRandomSubsample(group, sampleSize) {
    if (sampleSize > group.length) {
        throw new Error("Sample size exceeds group size.");
    }

    const sampledGroup = [];
    const usedIndices = new Set();

    while (sampledGroup.length < sampleSize) {
        const randomIndex = Math.floor(Math.random() * group.length);
        if (!usedIndices.has(randomIndex)) {
            sampledGroup.push(group[randomIndex]);
            usedIndices.add(randomIndex);
        }
    }

    return sampledGroup;
}

export function computeMeanAndCI(values, confidence = 0.95) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const lowerIndex = Math.floor((1 - confidence) / 2 * values.length);
    const upperIndex = Math.ceil((1 + confidence) / 2 * values.length) - 1;
    return {
        mean,
        ciLow: sortedValues[lowerIndex],
        ciHigh: sortedValues[upperIndex]
    };
}


export function computeROC(yTrue, yScores, positiveClass = 1) {
    const data = yTrue.map((trueLabel, index) => ({
        trueLabel,
        score: yScores[index]
    }))}