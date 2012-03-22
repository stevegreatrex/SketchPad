using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using SketchPad.Models;

namespace SketchPad.Controllers.Controllers
{
	public class BackgroundImageController : ApiController
	{
		private static List<ImageModel> _backgroundImages = new List<ImageModel>();

		static BackgroundImageController()
		{
			_backgroundImages.Add(new ImageModel
			{
				Id = Guid.NewGuid(),
				Name = "Birds Eye",
				Data = GetImageData("pitch1.png")
			});

			_backgroundImages.Add(new ImageModel
			{
				Id = Guid.NewGuid(),
				Name = "Goal Mouth",
				Data = GetImageData("pitch2.jpg")
			});

			_backgroundImages.Add(new ImageModel
			{
				Id = Guid.NewGuid(),
				Name = "Above Goal",
				Data = GetImageData("pitch3.jpg")
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
			return _backgroundImages;
		}

		// GET /api/<controller>/5
		public ImageModel Get(Guid id)
		{
			return _backgroundImages.FirstOrDefault(i => i.Id == id);
		}

		// POST /api/<controller>
		public void Post(ImageModel value)
		{
			_backgroundImages.Add(value);
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
			_backgroundImages.Remove(match);
		}
	}
}