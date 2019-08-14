export const addUser = (labelStore, playerStore) => {
    playerStore.list.push((playerStore.list.length+1).toString());
    const phaseName = ["preflop", "flop", "turn", "river"];
    playerStore.ownLabel[(playerStore.list.length).toString()] = {};
    for(let idx in phaseName) {
        playerStore.ownLabel[(playerStore.list.length).toString()][phaseName[idx]] = [];
    }
    labelStore.data[(playerStore.list.length).toString()] = {};
    labelStore.displayTotal[(playerStore.list.length).toString()] = {};
    for(let _name in phaseName) {
        let name = phaseName[_name];
        labelStore.displayTotal[(playerStore.list.length).toString()][name] = 0;
    }
}
