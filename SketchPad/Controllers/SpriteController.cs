using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using SketchPad.Models;

namespace SketchPad.Controllers
{
    public class SpriteController : ApiController
    {
		private static List<ImageModel> _sprites = new List<ImageModel>();

		static SpriteController()
		{
			_sprites.Add(new ImageModel
			{
				Id = Guid.NewGuid(),
				Name = "Player",
				Data = GetImageData("player.gif")
			});
			_sprites.Add(new ImageModel
			{
				Id = Guid.NewGuid(),
				Name = "Player 2",
				Data = GetImageData("player2.gif")
			});
		}

		static string GetImageData(string name)
		{
			using (var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(string.Format("SketchPad.Content.images.{0}", name)))
			{
				var bytes = new byte[stream.Length];
				stream.Read(bytes, 0, bytes.Length);
				var data = Convert.ToBase64String(bytes);
				return string.Format("data:image/png;base64,{0}", data);
			}
		}

		// GET /api/<controller>
		public IEnumerable<ImageModel> Get()
		{
			return _sprites;
		}

		// GET /api/<controller>/5
		public ImageModel Get(Guid id)
		{
			return _sprites.FirstOrDefault(i => i.Id == id);
		}

		// POST /api/<controller>
		public void Post(ImageModel value)
		{
			_sprites.Add(value);
		}

		// PUT /api/<controller>/5
		public void Put(ImageModel value)
		{
			var match = Get(value.Id);
			if (match == null) return;
			match.Name = value.Name;
			match.Data = value.Data;
		}

		// DELETE /api/<controller>/5
		public void Delete(Guid id)
		{
			var match = Get(id);
			if (match == null) return;
			_sprites.Remove(match);
		}
	}
}