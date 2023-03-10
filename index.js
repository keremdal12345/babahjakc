const { Client, EmbedBuilder, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const db = require("croxydb")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
readdirSync('./commands').forEach(f => {
  if(!f.endsWith(".js")) return;

 const props = require(`./commands/${f}`);

 client.commands.push({
       name: props.name,
       description: props.description,
       options: props.options,
       dm_permission: props.dm_permission,
       type: 1
 });

console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

  const eve = require(`./events/${e}`);
  const name = e.split(".")[0];

  client.on(name, (...args) => {
            eve(client, ...args)
        });
console.log(`[EVENT] ${name} eventi yüklendi.`)
});


const modal = new ModalBuilder()
.setCustomId('form')
.setTitle('Başvuru Formu')
  const a1 = new TextInputBuilder()
  .setCustomId('isim')
  .setLabel('Isim?')
  .setStyle(TextInputStyle.Paragraph) 
  .setMinLength(2)
  .setPlaceholder('isminiz')
  .setRequired(true)
	const a2 = new TextInputBuilder() 
	.setCustomId('yas')
	.setLabel('Yaş?')
  .setStyle(TextInputStyle.Paragraph)  
	.setMinLength(1)
	.setPlaceholder('Yaşın')
	.setRequired(true)
	const a3 = new TextInputBuilder() 
	.setCustomId('biz')
	.setLabel('Neden Biz?')
  .setStyle(TextInputStyle.Paragraph)  
	.setMinLength(1)
	.setPlaceholder('Neden Bizimle Çalışmak İstiyorsun?')
	.setRequired(true)
	const a4 = new TextInputBuilder() 
	.setCustomId('yetkili')
	.setLabel('Daha Önce Bir Sunucuda Yetkili Oldun Mu?')
	.setMinLength(1)
  .setStyle(TextInputStyle.Paragraph)  
	.setPlaceholder('Farklı bir sunucuda yetkili oldun mu?')
	const a5 = new TextInputBuilder() 
    .setCustomId('aciklama')
    .setLabel('Eklemek İstediğin?')
    .setMinLength(1)
    .setStyle(TextInputStyle.Paragraph) 
    .setPlaceholder('Ek olarak bir şey söylemek istiyorsan yazabilirsin.')
    const row = new ActionRowBuilder().addComponents(a1);
    const row2 = new ActionRowBuilder().addComponents(a2);
    const row3 = new ActionRowBuilder().addComponents(a3);
    const row4 = new ActionRowBuilder().addComponents(a4);
    const row5 = new ActionRowBuilder().addComponents(a5);
    modal.addComponents(row, row2, row3, row4, row5);
  
   
client.on('interactionCreate', async (interaction) => {

	if(interaction.customId === "başvuru"){
    await interaction.showModal(modal);
	}
})
 
    client.on('interactionCreate', async interaction => {
      if (interaction.type !== InteractionType.ModalSubmit) return;
      if (interaction.customId === 'form') {

  let log = db.fetch(`basvurulog_${interaction.guild.id}`)
let rol = db.fetch(`basvururol_${interaction.guild.id}`)


		const isim = interaction.fields.getTextInputValue('isim')
		const yas = interaction.fields.getTextInputValue('yas')
		const biz = interaction.fields.getTextInputValue('biz')
		const yetkili = interaction.fields.getTextInputValue('yetkili')
    const aciklama = interaction.fields.getTextInputValue('aciklama')
	
    const embed = new Discord.EmbedBuilder()
    .setTitle("Yeni başvuru geldi!")
    .setDescription(`Başvuran: **${interaction.user.tag}**\n\nIsim: **${isim}**\nYaş: **${yas}**\nNeden Biz? **${biz}**\nYetkili Olduğu Sunucular: **${yetkili}**\nAçıklama: **${aciklama}**         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`)
    .setColor(0x0099FF)
    const row = new Discord.ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
    .setCustomId('evet')
    .setLabel('Onayla')
    .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
    .setCustomId("hayir")
    .setLabel("Reddet")
    .setStyle(ButtonStyle.Danger))
  
    
    

const gonderildi = new EmbedBuilder()
        .setColor("Green")
        .setDescription("Başvurun yetkililere gönderildi.")
    await interaction.reply({embeds: [gonderildi], ephemeral: true });
    client.channels.cache.get(log).send({embeds: [embed], components: [row]}).then(async m => {
      db.set(`basvuru_${m.id}`, interaction.user.id)
    
      })
    }
    })




client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

if (interaction.customId == "evet") {
  interaction.deferUpdate()
  const data = await db.get(`basvuru_${interaction.message.id}`)
  if(!data) return;
const uye = data;
  let kanal = db.fetch(`basvurukanal_${interaction.guild.id}`)
  let rol = db.fetch(`basvururol_${interaction.guild.id}`)
 
  const onaylandi = new EmbedBuilder()
  .setColor("Green")
  .setTitle("Onaylandı!")
  .setDescription(`<@${uye}> adlı kullanıcının başvurusu onaylandı.`)
    client.channels.cache.get(kanal).send({embeds: [onaylandi]})
interaction.guild.members.cache.get(uye).roles.add(rol)

}
})


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

if (interaction.customId == "hayir") {
  interaction.deferUpdate()
  const data = await db.get(`basvuru_${interaction.message.id}`)
  if(!data) return;
const uye = data;
  let kanal = db.fetch(`basvurukanal_${interaction.guild.id}`)
  
 
  const reddedildi = new EmbedBuilder()
  .setColor("Red")
  .setTitle("Reddedildi!")
  .setDescription(`<@${uye}> adlı kullanıcının başvurusu reddedildi.`)
    client.channels.cache.get(kanal).send({embeds: [reddedildi]})

}
})




client.login(TOKEN)


