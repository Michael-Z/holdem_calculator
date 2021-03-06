import * as blockPatcher from "../dispatcher/block";

export const ColorBox = ["#008000", "#90B838", "#BCD683", "#bb1122", "#ff0000", "#f9af2b",
    "#0074bf", "#0000ff", "#283b67", "#4d5857", "#95969a", "#f6c25d"];


export const addLabel = (player, labelStore) => {
    if (player == "") {
        alert("choose player first!");
        return;
    }
    if (labelStore.playerLabel[player] === undefined) {
        labelStore.playerLabel[player] = [];
    }
    labelStore.playerLabel[player].push(labelStore.total + 1);
    labelStore.total = labelStore.total + 1;
    labelStore.cardRange[labelStore.total] = [];
    labelStore.displayTotal[player] += 1;
    labelStore.displayMatch[labelStore.total] = labelStore.displayTotal[player];
    labelStore.color[labelStore.total] = ColorBox[labelStore.displayTotal[player]-1];
}

import { patternCount } from './block';
import { shareChange } from './share';
export const addRange = (pct, pattern, blockName, blockStore, labelStore, cacheStore, shareStore, playerStore, change) => {
    let cacheName = blockName[2] === undefined ? "p" : blockName[2];
    cacheStore.range[cacheName] = { blockName: blockName, pct: pct, pattern: pattern };
    cacheStore.blockEnv[cacheName] = [];
    cacheStore.blockEnv[cacheName] = Object.assign(cacheStore.blockEnv[cacheName], blockStore.label[blockName]);

    let initCombo = patternCount(blockName, pattern[0], pattern[1]) * pct / 100;
    if(blockStore.left[blockName] - initCombo >= 0){
        blockStore.label[blockName].push({ label: labelStore.now, pct: pct, color: labelStore.color[labelStore.now], pattern: pattern, combo: initCombo });
        blockStore.totalCombo += initCombo;
        labelStore.cardRange[labelStore.now].push({ blockName: blockName, pct: pct, pattern: pattern });
        blockStore.left[blockName] -= initCombo;
    }
    shareChange(shareStore, playerStore, labelStore, blockStore);
    change(false);
}

import { checkEnv } from './cache';

export const addLabelRange = (e, labelStore, blockName, blockStore, cacheStore, shareStore, playerStore, rangeView, onDrag) => {
    if (labelStore.now === undefined) {
        return;
    }
    if (blockStore.left[blockName] <= 0) {
        return;
    }
    if (blockStore.label[blockName] === undefined) {
        blockStore.label[blockName] = [];
    }
    if (blockStore.label[blockName].findIndex((item) => item.label === labelStore.now) >= 0) { // 현재 label의 range가 이미 존재하는지 확인    
        return;
    }
    let cacheName = blockName[2] === undefined ? "p" : blockName[2];
    if (cacheStore.available | e.shiftKey) {
        if (cacheStore.range[cacheName].pct !== undefined) { // cache가 존재하는지
            console.log(cacheStore.range[cacheName].blockName, cacheStore.range[cacheName].pattern, cacheStore.range[cacheName].pct);
            if (checkEnv(blockStore.label[blockName], cacheStore.blockEnv[cacheName]) === false) { return; } // blockEnv가 일치하는지
            addRange(cacheStore.range[cacheName].pct, cacheStore.range[cacheName].pattern, blockName, blockStore, labelStore, cacheStore, shareStore, playerStore, rangeView);
        }
    }
    else {
        if (onDrag === true) { return; }
        rangeView({ blockName: blockName, existing: blockStore.label[blockName] });
    }
}

export const manValid = (e, val, blockStore, blockName, labelStore, target) => {
    const fval = parseInt(val);
    if (e.key === 'Enter') {
        if (fval !== undefined) {
            if (fval <= 100 && fval >= 0) {
                updateLabelPct(fval, labelStore, blockStore, blockName, target.label);
            }
        }
    }
}

export const updateLabelPct = (pct:number, labelStore, blockStore, blockName, labelName) => {
    let cut = labelStore.cardRange[labelName].findIndex(i => i.blockName === blockName);
    let Lcut = blockStore.label[blockName].findIndex(i => i.label === labelName);
    let now = pct;
    let deltaCombo = blockStore.label[blockName][Lcut].combo;
    let tmpCombo = blockStore.label[blockName][Lcut].combo / labelStore.cardRange[labelName][cut].pct;
    tmpCombo *= now;
    deltaCombo -= tmpCombo;
    if( blockStore.left[blockName] + deltaCombo < 0) { 
        alert("Percentage 범위를 벗어났습니다.");
        return; 
    }
    blockStore.label[blockName][Lcut].combo = tmpCombo;
    blockStore.totalCombo -= deltaCombo;
    blockStore.left[blockName] += deltaCombo;
    labelStore.cardRange[labelName][cut].pct = now;
    blockStore.label[blockName][Lcut].pct = now;
}

export const deleteLabelRange = (labelStore, blockStore, labelName, blockName, visibleSet, Out) => {
    if (labelStore.cardRange[labelName] === undefined) { return; }
    let cut = labelStore.cardRange[labelName].findIndex(i => i.blockName === blockName);
    let Lcut = blockStore.label[blockName].findIndex(i => i.label === labelName);

    if (cut < 0) { return; }
    blockStore.left[blockName] += blockPatcher.patternCount(blockName, blockStore.label[blockName][Lcut].pattern[0], blockStore.label[blockName][Lcut].pattern[1]) * blockStore.label[blockName][Lcut].pct / 100;
    blockStore.totalCombo -= blockPatcher.patternCount(blockName, blockStore.label[blockName][Lcut].pattern[0], blockStore.label[blockName][Lcut].pattern[1]) * blockStore.label[blockName][Lcut].pct / 100;
    labelStore.cardRange[labelName].splice(cut, 1);
    if (visibleSet !== false) { visibleSet.setVisible(false); }
    blockStore.label[blockName].splice(Lcut, 1);
    if (Out !== false) { Out[1]("F"); }
}

export const deleteLabel = (labelStore, blockStore, labelName, player) => {
    let nowBlock, x;
    for (let _nowBlock in labelStore.cardRange[labelName]) {
        nowBlock = labelStore.cardRange[labelName][_nowBlock];
        x = blockStore.label[nowBlock.blockName].findIndex(item => item.label === labelName);
        blockStore.left[nowBlock.blockName] += blockStore.label[nowBlock.blockName][x].combo;
        blockStore.totalCombo -= blockStore.label[nowBlock.blockName][x].combo;
        blockStore.label[nowBlock.blockName].splice(x, 1);
    }
    labelStore.cardRange[labelName] = [];
    let y = labelStore.playerLabel[player].findIndex(item => item === labelName);
    labelStore.playerLabel[player].splice(y, 1);
}

export const calLabelCombo = (labelNum, labelStore, blockStore) => {
    let labelCombo = 0;

    labelNum-=1;

    let labelVal = labelStore.playerLabel[parseInt(String(labelNum / 12)) + 1][labelNum % 12];
    for (let item in labelStore.cardRange[labelVal]) {
        let cal = labelStore.cardRange[labelVal][item];
        if (blockStore.label[cal.blockName] != undefined) {
            let N = blockStore.label[cal.blockName].length;
            let idx;
            for (idx = 0; idx < N; idx++) {
                if (blockStore.label[cal.blockName][idx].label == labelVal) break;
            }
            labelCombo += idx == N ? 0 : blockStore.label[cal.blockName][idx].combo;
        }
    }
    labelStore.labelCombo[labelNum+1] = labelCombo;
    // return labelCombo;
}

export const calLabelPercentage = (playerNum, labelStore) => {
    let playerTotalLabelCombo = 0;
    let N = playerNum * 12;

    for(let i = N - 11; i <= N; i++) playerTotalLabelCombo += labelStore.labelCombo[i];
    if(playerTotalLabelCombo != 0) for(let i = N - 11; i <= N; i++) labelStore.labelComboRatio[i] = labelStore.labelCombo[i] / playerTotalLabelCombo;
}