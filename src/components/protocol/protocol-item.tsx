import Table from 'react-bootstrap/Table';
import qiAdapter from '../../shared/protocols/qidao/qidao-adapter';
import qiFarms from '../../shared/protocols/qidao/qidao-farms';
import gmxAdapter from '../../protocols/gmx/gmx-frontend-adapter';
import { bnDisplay } from '../../helpers/tokenParser';
import { Protocols, ProtocolTypes } from '../../shared/protocols/constants';
import { ProtocolItem } from '../../shared/types/protocols';
import { rewardRouterAddress, rewardRouterABI } from '../../shared/protocols/mummy/mummy-abis';
import { mummyFarms } from '../../shared/protocols/mummy/mummy-farms';
import './protocol-item.scss';

export interface IProtocolItemComponent {
    items: ProtocolItem[];
    symbol: Protocols;
    type: ProtocolTypes;
}

export default function ProtocolItemComponent(req: IProtocolItemComponent) {
    const claimRewards = async (address: string) => {
        let contractStaticInfo;
        try {
            switch (req.symbol) {
                case Protocols.Qi_Dao:
                    contractStaticInfo = qiFarms.find(qiFarm => qiFarm.address === address);
                    if (contractStaticInfo) {
                        await qiAdapter.claimRewards(contractStaticInfo);
                    }
                    break;
                case Protocols.Mummy:
                    contractStaticInfo = mummyFarms.find(mummyFarms => mummyFarms.address === address);
                    if (contractStaticInfo) {
                        await gmxAdapter.claimRewards(contractStaticInfo, rewardRouterAddress, JSON.stringify(rewardRouterABI));
                    }
                    break;
                default:
                    throw Error('Claim not declared');
            }
        } catch (ex: any) {
            if (ex.code === 4001) {
                console.log('User rejected the tx');
            }
        }
    }

    const items = req.items;
    if (items) {
        return <Table>
            <thead>
                <tr className='protocol-column'>
                    <th>Pool</th>
                    <th>Balance</th>
                    <th>Rewards</th>
                    <th>USD Value</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr>
                        <td>{item.pool.map(p => p.name)}</td>
                        <td>
                            {
                                item.balance.map(balance => {
                                    return <div>{bnDisplay(balance.amount, 4) + ' ' + balance.currency.symbol}</div>
                                })
                            }
                        </td>
                        <td>
                            {
                                item.rewards.map(reward => {
                                    return <div>{bnDisplay(reward.amount, 4) + ' ' + reward.currency.symbol}</div>
                                })
                            }
                        </td>
                        <td>{item.usdValue}</td>
                        <td><button onClick={() => claimRewards(item.address)}>Claim</button></td>
                    </tr>
                ))}
            </tbody>
        </Table>
    } else {
        return <></>
    }
}