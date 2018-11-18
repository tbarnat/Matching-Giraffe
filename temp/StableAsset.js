/*--- KONIASIE ---*/

var horses = [{id: 'Lady'}, {id: 'Czejen'}, {id: 'Bracio'}, {id: 'Jadzia'},
    {id: 'Bella'}, {id: 'Parys'}, {id: 'Dzidzia'}, {id: 'Boski'}];

/*--- BACHORY ---*/

var clients = [
    {
        id: 'Ania', name: 'Ania',
        pref: [['Lady', 'Czejen'],['Bracio', 'Jadzia'],['Parys', 'Dzidzia']],
        excludes: ['Bella', 'Boski']
    },
    {
        id: 'Marta', name: 'Marta',
        pref: [['Bracio', 'Bella'],['Lady', 'Jadzia'],['Czejen', 'Parys', 'Dzidzia']],
        excludes: ['Boski']
    },
    {
        id: 'Julka', name: 'Julka',
        pref: [['Bella', 'Parys'],['Jadzia', 'Boski'],['Lady', 'Czejen', 'Bracio', 'Dzidzia']],
        excludes: []
    },
    {
        id: 'Tola', name: 'Tola',
        pref: [['Czejen', 'Jadzia', 'Dzidzia', 'Boski'],['Bracio', 'Bella'],['Lady']],
        excludes: ['Parys']
    }
];

/*--- INSTRUKTORY ---*/

var trainers = [{id: 'Ewa'}, {id: 'Paulina'}, {id: 'inna'}];

/*--- CAŁOŚĆ ---*/

var StableAsset = {
    clients: [],
    horses: horses,
    trainers: []
};