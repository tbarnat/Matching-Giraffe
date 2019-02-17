exports.dailyQuery3h = {
    day: '20190314',
    hours: [
        {
            hour: '1230',
            trainer: ['Paulina'],
            remarks: 'Maja ma zrobić ćwiczenie 3',
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja'},
                {kidName: 'Julka Lonza', horse:'Bracio'},
                {kidName: 'Ola C', horse:'Bella'},
            ]
        },
        {
            hour: '1430',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Ola C'},
                {kidName: 'Weronika'},
                {kidName: 'Emilka'},
                {kidName: 'Kalina'},
                {kidName: 'Paula'},
            ]
        },
        {
            hour: '1530',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Paula'},
                {kidName: 'Kalina'},
            ]
        },

    ],
    dailyExcludes: ['Parys'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
}

exports.dailyQuery3h_2 = {
    day: '20190314',
    hours: [
        {
            hour: '1230',
            trainer: ['Paulina'],
            remarks: 'Maja ma zrobić ćwiczenie 3',
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja', horse:'Lady'},
                {kidName: 'Julka Lonza', horse:'Bracio'},
                {kidName: 'Ola C', horse:'Bella'},
            ]
        },
        {
            hour: '1430',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Ola C'},
                {kidName: 'Weronika'},
                {kidName: 'Emilka'},
                {kidName: 'Kalina'},
                {kidName: 'Paula'},
            ]
        },
        {
            hour: '1530',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Paula'},
                {kidName: 'Kalina'},
            ]
        },

    ],
    dailyExcludes: ['Parys'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
}

exports.dailyQuery4h = { //PROBLEM
    day: '20190314',
    hours: [
        {
            hour: '1230',
            trainer: ['Paulina'],
            remarks: 'Maja ma zrobić ćwiczenie 3',
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja'},
                {kidName: 'Julka Lonza', horse:'Bracio'},
                {kidName: 'Ola C', horse:'Bella'},
            ]
        },
        {
            hour: '1430',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Ola C'},
                {kidName: 'Weronika'},
                {kidName: 'Emilka'},
                {kidName: 'Kalina'},
                {kidName: 'Paula'},
            ]
        },
        {
            hour: '1530',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Paula'},
                {kidName: 'Kalina'},
            ]
        },
        {
            hour: '1630',
            trainer: ['Paulina'],
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja'},
                {kidName: 'Julka Lonza', horse:'Bracio'},
                {kidName: 'Ola C', horse:'Bella'},
            ]
        },

    ],
    dailyExcludes: ['Parys'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
}

exports.dailyQuery4h_2 = { //??
    day: '20190314',
    hours: [
        {
            hour: '1230',
            trainer: ['Paulina'],
            remarks: 'Maja ma zrobić ćwiczenie 3',
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja', horse:'Lady'},
                {kidName: 'Julka Lonza', horse:'Bracio'},
                {kidName: 'Ola C', horse:'Bella'},
            ]
        },
        {
            hour: '1430',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Ola C'},
                {kidName: 'Weronika'},
                {kidName: 'Emilka'},
                {kidName: 'Kalina'},
                {kidName: 'Paula'},
            ]
        },
        {
            hour: '1530',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Paula'},
                {kidName: 'Kalina'},
            ]
        },
        {
            hour: '1630',
            trainer: ['Paulina'],
            trainingsDetails: [
                {kidName: 'Julka Mala'},
                {kidName: 'Maja', horse:'Lady'},
                {kidName: 'Julka Lonza', horse:'Bracio'},
                {kidName: 'Ola C', horse:'Bella'},
            ]
        },

    ],
    dailyExcludes: ['Parys'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
}

exports.dailyQuery4h_simple = { //??
    day: '20190314',
    hours: [
        {
            hour: '1330',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Julka Mala'},
            ]
        },
        {
            hour: '1430',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Ola C'},

            ]
        },
        {
            hour: '1530',
            trainer: ['Eva'],
            trainingsDetails: [
                {kidName: 'Paula'},

            ]
        },
        {
            hour: '1630',
            trainer: ['Paulina'],
            trainingsDetails: [
                {kidName: 'Kalina'},

            ]
        },

    ],
    dailyExcludes: ['Parys'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
}
