import GameManager from '../GameManager';
import Aux from '../SlotEnum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Machine extends cc.Component {
  @property(cc.Node)
  public button: cc.Node = null;

  @property(cc.Prefab)
  public _reelPrefab = null;

  @property({ type: cc.Prefab })
  get reelPrefab(): cc.Prefab {
    return this._reelPrefab;
  }

  set reelPrefab(newPrefab: cc.Prefab) {
    this._reelPrefab = newPrefab;
    this.node.removeAllChildren();

    if (newPrefab !== null) {
      this.createMachine();
    }
  }

  @property({ type: cc.Integer })
  public _numberOfReels = 3;

  @property({ type: cc.Integer, range: [3, 6], slide: true })
  get numberOfReels(): number {
    return this._numberOfReels;
  }

  set numberOfReels(newNumber: number) {
    this._numberOfReels = newNumber;

    if (this.reelPrefab !== null) {
      this.createMachine();
    }
  }

  private reels = [];

  public spinning = false;

  private numberOfLines: number;

  public glowing: boolean = false;

  createMachine(): void {
    this.node.destroyAllChildren();
    this.reels = [];

    let newReel: cc.Node;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      newReel = cc.instantiate(this.reelPrefab);
      this.node.addChild(newReel);
      this.reels[i] = newReel;

      const reelScript = newReel.getComponent('Reel');
      reelScript.owner = this;//passa a referência de machine para reel, que irá passar para os tiles
      reelScript.shuffle();
      reelScript.reelAnchor.getComponent(cc.Layout).enabled = false;
    }

    this.node.getComponent(cc.Widget).updateAlignment();
  }

  spin(): void {
    this.glowing = false;
    this.spinning = true;
    this.button.getChildByName('Label').getComponent(cc.Label).string = 'STOP';

    for (let i = 0; i < this.numberOfReels; i += 1) {
      const theReel = this.reels[i].getComponent('Reel');

      if (i % 2) {
        theReel.spinDirection = Aux.Direction.Down;
      } else {
        theReel.spinDirection = Aux.Direction.Up;
      }

      theReel.doSpin(0.03 * i);
    }
  }

  lock(): void {
    this.button.getComponent(cc.Button).interactable = false;
  }

  stop(result: Array<Array<number>> = null): void {
    setTimeout(() => {
      this.spinning = false;
      this.button.getComponent(cc.Button).interactable = true;
      this.button.getChildByName('Label').getComponent(cc.Label).string = 'SPIN';
      this.glowing = true;

    }, 2500);
    this.numberOfLines = this.numberOfEqualLines();//Aleatorizar antes de rodar quantas linhas deverão ser iguais
    const rngMod = Math.random() / 2;
    let slotValue = Math.random();//Figurinha aleatória para parar
    for (let i = 0; i < this.numberOfReels; i += 1) {
      const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
      const theReel = this.reels[i].getComponent('Reel');
      if(this.numberOfLines > 0){//alguma linha deve ser igual?
        //TO DO determinar qual(is) linha(s) será(ão) igual(is) aleatoriamente.
        result[i] = [];
        for(let c = 0; c < 3; c++)//Passar para roleta a figura que ficará em cada posição
        {
          if(this.numberOfLines >= c){
            result[i][c] = slotValue;//Qual slot irá parar
          }
          else{
            result[i][c] = -1;//slot aleatório
          };
        }
        //fingir que foi acaso
      }
      setTimeout(() => {
        theReel.readyStop(result[i]);
      }, spinDelay * 1000);
    }
  }
  numberOfEqualLines(): number{
    let prob = Math.random()*100;
    if(prob < 49){
      return 0;
    }
    else if(prob < 82){
      return 1;
    }
    else if(prob < 92){
      return 2;
    }
    return 3;
  }
}
