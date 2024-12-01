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