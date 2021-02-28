import Machine from "./Machine";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  @property({ type: [cc.SpriteFrame], visible: true })
  private textures = [];

  @property({ type: [cc.Node], visible: true})
  private glowNode = null;
  public owner: Machine;
  private glow:boolean;
  async onLoad(): Promise<void> {
    await this.loadTextures();
  }

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    this.setRandom();
    //this.glowSprite = this.glowNode.getComponent('Sprite');
  }

  async loadTextures(): Promise<boolean> {
    const self = this;
    return new Promise<boolean>(resolve => {
      cc.loader.loadResDir('gfx/Square', cc.SpriteFrame, function afterLoad(err, loadedTextures) {
        self.textures = loadedTextures;
        resolve(true);
      });
    });
  }
  update(deltaTime:number): void{
    if(this.owner.glowing && this.glow){//glow diz se esse tile deve brilhar, e machine diz quando brilhar.
      this.glowNode.active = true;
    }
    else{
      this.glowNode.active = false;
    }
  }
  setTile(index: number, glow: boolean = false): void {
    const v = Math.floor((index * this.getNumberOfTextures()));//Pegue o valor aleatório recebido, e pegue um correspondente na lista de texturas
    this.glow = glow;//devo brilhar quando for a hora?
    this.node.getComponent(cc.Sprite).spriteFrame = this.textures[v];
  }

  setRandom(): void {
    const randomIndex = Math.random();
    this.glowNode.active = false;
    this.setTile(randomIndex);
  }
  getNumberOfTextures() :number{
    return this.textures.length;
  }
}
