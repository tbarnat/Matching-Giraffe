//RUN WITH TAP-SPEC: node test/3_test_uc.js | node_modules/.bin/tap-spec

genericTest = require('./0_genericTest').genericTest

// req_res_arr: {no:number, action:string, reqData:{}, success:boolean, errorMsg?:string, resData?: {}}
let req_res_arr = [
  {no:0, action:'get_matches', reqData:{dailyQuery0}, success:true, resData:{}},
  {no:0, action:'get_matches', reqData:{dailyQuery1}, success:true, resData:{}},
]

genericTest('### ### Get matches test ### ###','test_user1','asd', req_res_arr)

//execute db_init first to get proper db values for test - user 'qwe'

//case:0 - calibrating CORRECT query
let dailyQuery0 = {
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
        {kidName: 'Kalina', horse:'Dzidzia'},
        {kidName: 'Ola C', horse:''},
        {kidName: 'Maja', horse:''},
      ],
    },
    {
      hour: '1430',
      trainer: [],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Paula',horse:'Dzidzia'},
        {kidName: 'Kalina'},
      ],
    },
  ],
  dailyExcludes: []
}

//case1: to many fields
let dailyQuery1 = {
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
}

//case2: to fewfields
let dailyQuery2 = {
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
}

//case3: to incorrect structure
let dailyQuery3 = {
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
}

//case4: misspelled keys
let dailyQuery4 = {
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina'],
      remaks: '', // <-INCORRECT
      trainingsDetails: [
        {kidName: 'Julka Mala'},
      ],
    },
  ],
  dailyExcludes: []
}

//case5: incorrect day format - to long
let dailyQuery5 = {
  day: '2019-03-14-bugbug', // <-INCORRECT
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
}

//case6: incorrect day format - not number
let dailyQuery6 = {
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
}

//case7: incorrect day format - not convertable to date
let dailyQuery7 = {
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
}

//case8: day already exists
let dailyQuery8 = {
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
}

//case9: hour format incorrect
let dailyQuery9 = {
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
}

//case10: hours not sorted
let dailyQuery10 = {
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
}

//case11: kid does not exist
let dailyQuery11 = {
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
}

//case12: kid does not exist
let dailyQuery12 = {
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina'],
      remarks: '',
      trainingsDetails: [
        {kidName: '', horse: ''},// <-INCORRECT
      ],
    },
  ],
  dailyExcludes: []
}

//case13: horse does not exist
let dailyQuery13 = {
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
}

//case14 trainer does not exist
let dailyQuery14 = {
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
}

//case:15 excluded horse does not exist
let dailyQuery15 = {
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
}

//case:16 repeated data - trainers
let dailyQuery16 = {
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina','Paulina'],// <-INCORRECT
      remarks: '',
      trainingsDetails: [
        {kidName: 'Julka Mala'},
      ],
    },
  ],
  dailyExcludes: ['Parys']
}

//case:17 repeated data - kids
let dailyQuery17 = {
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina'],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Julka Mala'},
        {kidName: 'Julka Mala',horse:'Dzidzia'},// <-INCORRECT
      ],
    },
  ],
  dailyExcludes: ['Parys']
}


//case:18 repeated data - predefined horses
let dailyQuery18 = {
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina'],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Julka Mala',horse:'Dzidzia'},
        {kidName: 'Paula',horse:'Dzidzia'},// <-INCORRECT
      ],
    },
  ],
  dailyExcludes: ['Parys']
}

//case:19 repeated data - horse in excluded and in predefined match
let dailyQuery19 = {
  day: '2019-03-14',
  hours: [
    {
      hour: '1230',
      trainer: ['Paulina'],
      remarks: '',
      trainingsDetails: [
        {kidName: 'Paula',horse:''},
        {kidName: 'Weronika',horse:'Parys'},// <-INCORRECT
      ],
    },
  ],
  dailyExcludes: ['Parys']
}

//case:20 incomplete preferences
let dailyQuery20 = {
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
}

//case:21 incomplete preferences
let dailyQuery21 = {
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
}

//case:22 - nothing to solve
let dailyQuery22 = {
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
}