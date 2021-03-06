import * as React from 'react';
import {useContext} from 'react';
import {observer} from 'mobx-react-lite';
import {label, player} from '../store';
import {ColorBox} from '../dispatcher/label';
import styled from 'styled-components';

const LabelPad = observer(() => {
    const labelStore = useContext(label);
    const playerStore = useContext(player);
    
    let tmpLabel = [];
    let N = playerStore.now * 12;
    for(let i = 0; i < 12; i++) tmpLabel[i] = i;

    let nowPlayer = playerStore.now;
    return(<LabelPadStyle>
        {tmpLabel.map((item, idx) => {
            return(
            <LabelStyle color={ColorBox[idx]}
            onClick={() => { if(playerStore.now !== "") labelStore.now = labelStore.playerLabel[playerStore.now][item]; }}>
                {(labelStore.labelComboRatio[item + 1 + (nowPlayer-1) * 12] * 100).toFixed(1)}%
                ({labelStore.labelCombo[item + 1 + (nowPlayer-1) * 12]})
            </LabelStyle>);
        })}
    </LabelPadStyle>);
});

export default LabelPad;

const LabelPadStyle = styled.div`
    display: flex; flex-direction: row; flex-wrap: wrap;
`;
const LabelStyle = styled.div`
    cursor: pointer;
    width: 80px; text-align: center; padding: 10px 0px 10px 0px; 
    background-color: ${props => props.color ? props.color : "white"}; 
`;
