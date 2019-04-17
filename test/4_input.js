//execute db_init first to get proper db values for test - user 'qwe'

//case:0 - calibrating CORRECT query
exports.dailyQueries = [{
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina'],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Julka Mala'},
      ],
    },
    {
      hour: '1330',
      trainer: ['Ja'],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Julka Mala'},
        {kidName: 'Kalina', horse: 'Dzidzia'},
        {kidName: 'Ola C', horse: ''},
        {kidName: 'Maja', horse: ''},
      ],
    },
    {
      hour: '1430',
      trainer: [],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Paula', horse: 'Dzidzia'},
        {kidName: 'Kalina'},
      ],
    },
  ],
  dailyExcludes: []
},
  // 1
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
        foo: 'bar' // <-INCORRECT
      },
    ],
    dailyExcludes: []
  },

  // 2
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        remarks: '',
        // <-INCORRECT
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    remarks: '',
    dailyExcludes: []
  },

  // 3
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        remarks: '',
        trainer: ['Paulina'],
        trainingsDetails: [[ // <-INCORRECT
          {kidName: 'Julka Mala'},
        ]],
      },
    ],
    dailyExcludes: []
  },

  // 4
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remaks: 'x', // <-INCORRECT
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: []
  },
  //5
  {
    day: '2019-03-142', // <-INCORRECT
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: []
  },
  //6
  {
    day: '2O19-03-I4', // <-INCORRECT
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: []
  },
  //7
  {
    day: '2019-02-31', // <-INCORRECT
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: []
  },
  //8
  {
    day: '2019-01-01', // <-INCORRECT
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {
            kidName: 'Julka Mala',
            horse: ''
          },
        ],
      },
    ],
    dailyExcludes: []
  },
  //9
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '12:30', // <-INCORRECT
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala', horse: ''},
        ],
      },
    ],
    dailyExcludes: []
  },
  //10
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1330', // <-INCORRECT
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala', horse: ''},
        ],
      },
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala', horse: ''},
        ],
      },
    ],
    dailyExcludes: []
  },
  //11
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Bug kid', horse: ''},// <-INCORRECT
        ],
      },
    ],
    dailyExcludes: []
  },
  //12
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'x', horse: 'x'},// <-INCORRECT
        ],
      },
    ],
    dailyExcludes: []
  },
  //13
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {
            kidName: 'Julka Mala',
            horse: 'Bug horse' // <-INCORRECT
          },
        ],
      },
    ],
    dailyExcludes: []
  },
  //14
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Bug trainer'], // <-INCORRECT
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: []
  },
  //15
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: ['Bug horse'] // <-INCORRECT
  },
  //16
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina', 'Paulina'],// <-INCORRECT
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
        ],
      },
    ],
    dailyExcludes: ['Parys']
  },
  //17
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala'},
          {kidName: 'Julka Mala', horse: 'Dzidzia'},// <-INCORRECT
        ],
      },
    ],
    dailyExcludes: ['Parys']
  },
  //18
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Julka Mala', horse: 'Dzidzia'},
          {kidName: 'Paula', horse: 'Dzidzia'},// <-INCORRECT
        ],
      },
    ],
    dailyExcludes: ['Parys']
  },
  //19
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'Paula', horse: ''},
          {kidName: 'Weronika', horse: 'Parys'},// <-INCORRECT
        ],
      },
    ],
    dailyExcludes: ['Parys']
  },
  //20
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'IncompletePreferences'}, // <-INCORRECT
        ],
      },
    ],
    dailyExcludes: []
  },
  //21
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {kidName: 'InvalidPreferences'}, // <-INCORRECT
        ],
      },
    ],
    dailyExcludes: []
  },
  //22
  {
    day: '2019-03-14',
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        remarks: '',
        trainingsDetails: [
          {
            kidName: 'Julka Mala',
            horse: 'Bracio'
          },
        ],
      },
    ],
    dailyExcludes: []
  },
  //23
  {
    day: "2019-03-14",
    hours: [
      {
        hour: "1230",
        trainer: [
          "Paulina"
        ],
        trainingsDetails: [
          {
            kidName: "Julka Mala",
            horse: "Bracio"
          },
        ]
      },
      {
        hour: "1330",
        trainer: [
          "Paulina"
        ],
        trainingsDetails: [
          {
            kidName: "Emilka"
          },
        ]
      }
    ],
    dailyExcludes: [],
  }
]

exports.response0 = {
  solution: {
    day: "2019-03-14",
    hours: [
      {
        hour: "1230",
        trainer: [
          "Paulina"
        ],
        trainingsDetails: [
          {
            kidName: "Julka Mala",
            horse: "Czejen"
          }
        ]
      },
      {
        hour: "1330",
        trainer: [
          "Ja"
        ],
        trainingsDetails: [
          {
            kidName: "Maja",
            horse: "Lady"
          },
          {
            kidName: "Ola C",
            horse: "Parys"
          },
          {
            kidName: "Julka Mala",
            horse: "Czejen"
          },
          {
            kidName: "Kalina",
            horse: "Dzidzia"
          }
        ]
      },
      {
        hour: "1430",
        trainer: [],
        trainingsDetails: [
          {
            kidName: "Kalina",
            horse: "Bella"
          },
          {
            kidName: "Paula",
            horse: "Dzidzia"
          }
        ]
      }
    ]
  }
}

exports.response22 = {
  solution: {
    day: "2019-03-14",
    hours: [
      {
        hour: "1230",
        trainer: [
          "Paulina"
        ],
        trainingsDetails: [
          {
            kidName: "Julka Mala",
            horse: "Bracio"
          }
        ]
      }
    ],
  }
}

exports.response23 = {
  solution: {
    day: "2019-03-14",
    hours: [
      {
        hour: "1230",
        trainer: [
          "Paulina"
        ],
        trainingsDetails: [
          {
            kidName: "Julka Mala",
            horse: "Bracio"
          },
        ]
      },
      {
        hour: "1330",
        trainer: [
          "Paulina"
        ],
        trainingsDetails: [
          {
            kidName: "Emilka",
            horse: "Dzidzia"
          },
        ]
      }
    ],
  }
}
