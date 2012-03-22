using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SketchPad.Models
{
	public class ImageModel
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public string Data { get; set; }
	}
}